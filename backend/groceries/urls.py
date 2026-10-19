from rest_framework.routers import DefaultRouter
from .views import GroceryListViewSet, GroceryItemViewSet, RegistrationView, MonthlyBudgetView, MonthlyBudgetHistoryView,  current_month_spending, spending_comparison, spending_history,  GoogleLoginView, ForgotPasswordView, ResetPasswordView
from django.urls import path

# Create a router
# The router automatically generates the API URLs
# for our ViewSets
router = DefaultRouter()

# Register the groceryList API
router.register(
    r'grocery-lists',
    GroceryListViewSet,
    basename = 'grocery-list'
)

# Register the GroceryItem API
router.register(
    r'grocery-items',
    GroceryItemViewSet,
    basename='grocery-item'
)

# Additional url patterns that aren't viewsets
urlpatterns = [
    path(
        'register/',
        RegistrationView.as_view(),
        name='register'
    ),
    path(
    "auth/google/",
    GoogleLoginView.as_view(),
    name="google-login",
),
    
    path(
        'spending/current/',
        current_month_spending,
        name = 'current-month-spending'
    ),
    path(
        'spending/comparison/',
        spending_comparison,
        name = 'spending-comparison'
    ),
    path(
        'spending/history/',
        spending_history,
        name='spending-history'
    ),
    path(
        'budget/',
        MonthlyBudgetView.as_view(),
        name="monthly-budget"
    ),
    path(
        "budget/history/",
        MonthlyBudgetHistoryView.as_view(),
        name="monthly-budget-history",
    ),
    path(
    "auth/forgot-password/",
    ForgotPasswordView.as_view(),
    name="forgot-password",
),

path(
    "auth/reset-password/",
    ResetPasswordView.as_view(),
    name="reset-password",
),
    

]

# Make the automatically generated URLs available
urlpatterns += router.urls