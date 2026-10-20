import logging
from datetime import date
from django.utils import timezone

from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

from .models import GroceryList, GroceryItem, MonthlyBudget
from .serializers import (
    GroceryListSerializer,
    GroceryItemSerializer,
    RegistrationSerializer,
    MonthlyBudgetSerializer
)
from .services import get_monthly_spending, get_previous_month, compare_months
from django.db.models import Sum
from django.db.models.functions import TruncMonth

logger = logging.getLogger(__name__)

# Create your views here.

class GroceryListViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creating, viewing, updating
    and deleting grocery lists.
    """

    serializer_class = GroceryListSerializer

    def get_queryset(self):
        """
        Return only grocery lists beloging to currently
        logged-in user.
        """

        return GroceryList.objects.filter(
            owner=self.request.user
        )

    def perform_create(self, serializer):
        """
        Automatically assign the logged-in user
        as the owner of the new grocery list.
        """
        serializer.save(
            owner=self.request.user
        )


class GroceryItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creating, viewing, updating
    and deleting individual grocery items.
    """

    serializer_class = GroceryItemSerializer

    def get_queryset(self):
        """
        Return only grocery items belonging to
        grocery lists owned by the logged-in user.
        """
        return GroceryItem.objects.filter(
            grocery_list__owner=self.request.user
        )

class RegistrationView(generics.CreateAPIView):
    """
    API endpoint for creating a new user account.
    """

    serializer_class = RegistrationSerializer

    # Registration must be available to users
    # who are not logged in yet
    permission_classes = [AllowAny]

class MonthlyBudgetView(APIView):
    # Only authenticated users can access their budgets
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Use the current month unless another month is requested
        today = timezone.localdate()

        try:
            year = int(request.query_params.get("year", today.year))
            month = int(request.query_params.get("month", today.month))
        except (TypeError, ValueError):
            return Response(
                {"detail": "Year and month must be valid integers"},
                status=400
            )

        # Validate the requested month
        if not 1 <= month <= 12 or not 2000 <= year <= 2100:
            return Response(
                {"detail": "Invalid year or month."},
                status=400
            )

        # Never return another user's budget
        budget = MonthlyBudget.objects.filter(
            owner=request.user,
            year=year,
            month=month
        ).first()

        # A missing budget is normal for a new month.
        if budget is None:
            return Response({"budget": None})

        return Response({
            "budget": MonthlyBudgetSerializer(budget).data
        })

    def post(self, request):
        # Validate the submitted year, month, and amount
        serializer = MonthlyBudgetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        year = serializer.validated_data["year"]
        month = serializer.validated_data["month"]
        amount = serializer.validated_data["amount"]

        # Create the budget, or update it if one already exists
        # for this user and month.
        budget, created = MonthlyBudget.objects.update_or_create(
            owner=request.user,
            year=year,
            month=month,
            defaults={"amount": amount}
        )

        return Response(
            {
                "message": (
                    "Budget created succesfully."
                    if created
                    else "Budget updated successfully."
                ),
                "budget": MonthlyBudgetSerializer(budget).data,
            },
            status=201 if created else 200
        )


class MonthlyBudgetHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # use the current local date to determine the latest month.
        today = timezone.localdate()

        history = []

        # Build a history for the most recent 12 months,
        # including the current month
        for offset in range(12):
            month_index = today.year * 12 + today.month - 1 - offset
            year = month_index // 12
            month = month_index % 12 + 1

            # find this user's budget for the selected month
            budget = MonthlyBudget.objects.filter(
                owner=request.user,
                year=year,
                month=month,
            ).first()

            # Calculate this user's purchased-item spending
            # for the selected month.
            spending = GroceryItem.objects.filter(
                grocery_list__owner=request.user,
                purchased=True,
                purchased_at__year=year,
                purchased_at__month=month,
            ).aggregate(total=Sum("price"))["total"] or 0

            budget_amount = (
                budget.amount if budget else None
            )

            # Calculate the difference only when a budget exists.
            remaining = (
                budget_amount - spending
                if budget_amount is not None
                else None
            )

            if budget_amount is None:
                status = "no_budget"
            elif spending > budget_amount:
                status = "over_budget"
            else:
                status = "under_budget"

            history.append({
                "year": year,
                "month": month,
                "budget": budget_amount,
                "spent": spending,
                "remaining": remaining,
                "status": status,
            })

        return Response(history)

@api_view(["GET"])
def current_month_spending(request):
    """
    Return grocery spending for the current month.
    """

    # Get today's date.
    today = date.today()

    # Calculate spending for the current year and month.
    spending = get_monthly_spending(
        request.user,
        today.year,
        today.month
    )

    return Response({
        "month": today.strftime("%B %Y"),
        "total_spent": spending["total"],
        "items_purchased": spending["items_purchased"],
    })


class ForgotPasswordView(APIView):
    """Email a reset link to an eligible password-based account."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email", "")
        if not isinstance(email, str) or not email.strip():
            return Response(
                {"detail": "A valid email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        generic_message = {
            "detail": (
                "If an eligible account exists with this email, "
                "a password reset link has been sent."
            )
        }

        try:
            User = get_user_model()
            users = User.objects.filter(
                email__iexact=email.strip(),
                is_active=True,
            )

            for user in users:
                # Accounts using only Google sign-in cannot reset a local password.
                if not user.has_usable_password():
                    continue

                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                frontend_url = settings.FRONTEND_URL.rstrip("/")
                reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

                # This invokes the Resend backend configured in Django MAILERS.
                send_mail(
                    subject="Reset your GroceryTrackerZM password",
                    message=(
                        "Hello,\n\n"
                        "We received a request to reset your GroceryTrackerZM "
                        "password.\n\n"
                        f"Click the link below:\n{reset_link}\n\n"
                        "If you did not request this, ignore this email."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )

            return Response(generic_message, status=status.HTTP_200_OK)

        except Exception as exc:
            # Avoid logging reset tokens, recipient addresses, or API credentials.
            logger.error(
                "PASSWORD RESET FAILED: exception type=%s",
                type(exc).__name__,
            )
            return Response(
                {"detail": "Unable to send password reset email. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class ResetPasswordView(APIView):
    """
    Validate a password reset token and update
    the user's password.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        password2 = request.data.get("password2")

        if not all(
            isinstance(value, str) and value
            for value in [uid, token, password, password2]
        ):
            return Response(
                {"detail": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if password != password2:
            return Response(
                {"detail": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reject expired, invalid, or already-used tokens.
        if (
            not user.is_active
            or not user.has_usable_password()
            or not default_token_generator.check_token(user, token)
        ):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Apply Django's configured password validators.
        try:
            validate_password(password, user=user)
        except ValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=["password"])

        return Response(
            {"detail": "Password reset successfully. Please log in."},
            status=status.HTTP_200_OK,
        )

@api_view(["GET"])
def spending_comparison(request):
    """
    Compare the current month's grocery spending
    with the previous months's spending.
    """

    # Get today's date
    today = date.today()

    # Get the previous month
    previous_year, previous_month = get_previous_month(
        today.year,
        today.month
    )

    # Calculate the comparison
    comparison = compare_months(
        request.user,
        today.year,
        today.month
    )

    return Response({
        "current_month": {
            "month": today.strftime("%B %Y"),
            "total": comparison["current"]["total"],
        },

        "previous_month": {
            "month": date(
                previous_year,
                previous_month,
                1

            ).strftime("%B %Y"),
            "total": comparison["previous"]["total"],
        },

        "difference": comparison["difference"],
        "percentage_change": comparison["percentage_change"],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spending_history(request):
    """
    Return the user's grocery spending grouped by month.
    """

    monthly_spending = (
        GroceryItem.objects.filter(
            grocery_list__owner=request.user,
            purchased=True,
            price__isnull=False,
        )
        .annotate(
            month=TruncMonth('purchased_at')
        )
        .values('month')
        .annotate(
            total=Sum('price')

        )
        .order_by('month')
    )

    history = []

    for month in monthly_spending:

        history.append({
            'month': month['month'].strftime('%Y-%m'),
            'total': month['total'],
        })

    return Response(history)



class GoogleLoginView(APIView):
    """
    Authenticate a user with a verified Google ID token
    and return GroceryTrack JWT tokens.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        credential = request.data.get("credential")

        if not isinstance(credential, str) or not credential:
            return Response(
                {"detail": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {"detail": "Google authentication is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            # Verify the token signature, expiration and audience.
            payload = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

        except (ValueError, Exception) as exc:
            # Never expose token details in the response.
            return Response(
                {"detail": "Invalid Google authentication token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        google_sub = payload.get("sub")
        email = payload.get("email")
        email_verified = payload.get("email_verified", False)

        if not google_sub or not email or email_verified is not True:
            return Response(
                {"detail": "A verified Google email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from .google_auth_models import GoogleAccount

        User = get_user_model()

        with transaction.atomic():
            # Retrieve an account previously linked to Google.
            google_account = (
                GoogleAccount.objects.select_related("user")
                .filter(google_sub=google_sub)
                .first()
            )

            if google_account:
                user = google_account.user

            else:
                # Never automatically claim an existing account
                # merely because its email matches Google's.
                if User.objects.filter(email__iexact=email).exists():
                    return Response(
                        {
                            "detail": (
                                "An account with this email already exists. "
                                "Log in using your existing credentials."
                            )
                        },
                        status=status.HTTP_409_CONFLICT,
                    )

                # Create a unique username using Google's subject ID.
                base_username = f"google_{google_sub}"
                username = base_username[:150]

                if User.objects.filter(username=username).exists():
                    return Response(
                        {"detail": "Unable to create Google account."},
                        status=status.HTTP_409_CONFLICT,
                    )

                user = User.objects.create_user(
                    username=username,
                    email=email,
                )

                # Google users authenticate through Google, not a
                # local password.
                user.set_unusable_password()
                user.save(update_fields=["password"])

                GoogleAccount.objects.create(
                    user=user,
                    google_sub=google_sub,
                )

        # Issue the same JWT tokens used by password login.
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
            },
            status=status.HTTP_200_OK,
        )
