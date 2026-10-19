from rest_framework import serializers
from .models import GroceryList, GroceryItem, MonthlyBudget
from django.contrib.auth.models import User
from django.utils import timezone

class GroceryItemSerializer(serializers.ModelSerializer):
    """
    Serializer for creating, viewing and updating grocery items.
    """

    class Meta:
        model = GroceryItem

        # Fields that will be available through the API
        fields = [
            'id',
            'grocery_list',
            'name',
            'quantity',
            'price',
            'purchased',
            'purchased_at',
            'created_at',
        ]

        # These are values are controlled by the backend
        read_only_fields = [
            'id',
            'purchased_at',
            'created_at',
        ]

    def validate_grocery_list(self, grocery_list):
        """
        Make sure the grocery list belongs to 
        the currently logged-in user.
        """
        request = self.context.get("request")

        if request and grocery_list.owner != request.user:
            raise serializers.ValidationError(
                "You do not have permission to add items to this grocery list."
            )

        return grocery_list

    def validate(self, data):
        """
        Apply business rules before an item is saved.

        A grocery item cannot be marked as purchased unless a price has been entered
        """

        # get the grocery list being used for this item.
        grocery_list = data.get(
            'grocery_list',
            self.instance.grocery_list if self.instance else None
        )

        # Get today's date.
        today = timezone.localdate()

        # Do not allow new items to be added to a grocery
        # list from a previous month
        if self.instance is None and grocery_list is not None:

            if(
                grocery_list.created_at.year != today.year
                or grocery_list.created_at.month != today.month
            ):
                raise serializers.ValidationError({
                    'grocery_list': (
                        'You cannot add new items to a grocery '
                        'list from a previous item. '
                        'Please create a new grocery list for '
                        'the current month. '
                    )
                })


        # Get the purchased value from the incoming request
        purchased = data.get(
            'purchased',
            self.instance.purchased if self.instance else False
        )

        # Get the price from the incoming request
        price = data.get('price',  self.instance.price if self.instance else None)

        # If the item is being marked as purchased
        # but no price has being provided, reject it
        if purchased and price is None:
            raise serializers.ValidationError({
                'price':'You must enter a price before this item is marked as purchased.'
            })

        return data

class GroceryListSerializer(serializers.ModelSerializer):
    """
    Converts GroceryList model objects into JSOn
    and converts incoming JSON into GroceryList objects.

    The serializer also returns the grocery items belonging to the list.

    """

    # "items" comes from the related_name="items"
    # that we defined on the GroceryItem ForeignKey.
    # This allows the API to include all items belonging to this grocery list
    items = GroceryItemSerializer(
        many = True,
        read_only = True
    )

    class Meta:
        model = GroceryList

        # Fields that we want to expose through the API
        fields = [
            'id',
            'name',
            'created_at',
            'items',
        ]

        # These fields are generated automatically by Django,
        # so the user should not be able to modify them
        read_only_fields = [
            'id',
            'created_at',
            'items',
        ]


class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer used to create a new user account.
    """

    # Password is write-only so it is never returned in the API response
    password = serializers.CharField(
        write_only = True,
        min_length = 8
    )

    # User must enter the password twice
    password2 = serializers.CharField(
        write_only = True
    )

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'password',
            'password2',
        ]

    def validate(self, data):
        """
        Make sure both passwords are the same.
        """

        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                'password': 'Passwords do not match.'
            })

        return data

    def create(self, validated_data):
        """
        Create the user using Django's create_user()
        so that the password is properly hashed.
        """

        # password2 is only for validation.
        validated_data.pop('password2')

        user = User.objects.create_user(
            username = validated_data['username'],
            email = validated_data['email'],
            password = validated_data['password']
        )

        return user


class MonthlyBudgetSerializer(serializers.ModelSerializer):
    # Validate and serialize the user's monthly budget
    class Meta:
        model = MonthlyBudget
        fields = [
            "id",
            "year",
            "month",
            "amount",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_month(self, value):
        # A calender month must be between 1 and 12
        if not 1 <= value <= 12:
            raise serializers.ValidationError(
                "Month must be between 1 and 12"
            )

        return value

    def validate_year(self, value):
        # Reject invalid calender years.
        if value < 2000 or value > 2100:
            raise serializers.ValidationError(
                "Year must be between 2000 and 2100."
            )

        return value

    def validate_amount(self, value):
        # A budget must be positive
        if value <= 0:
            raise serializers.ValidationError(
                "Budget must be greater than zero."
            )

        return value





