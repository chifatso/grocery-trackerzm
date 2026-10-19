from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.
class GroceryList(models.Model):
    # The user who owns the grocery list
    # Each grocery list belongs to exactly one user
    # CASCADE means when the user is deleted all the grocery lists associated with that user are deleted as well
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="grocery_lists"
    )

    # Name of the grocery list, e.g. "September Groceries"
    name = models.CharField(max_length=100)

    # Automatically records when the grocery list was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class GroceryItem(models.Model):
    # Connect this item to a specific grocery list
    # CASCADE means that if the grocery list is deleted,
    # all of its items will also be deleted
    grocery_list = models.ForeignKey(GroceryList, on_delete=models.CASCADE, related_name="items")

    # The name of the grocery item e.g.
    name = models.CharField(max_length=100)

    # How many of thisitem the user wants to buy
    quantity = models.PositiveIntegerField(default=1)

    # The actual price paid for the item
    # null = True and blank = True allow this field to be empty
    # when the item has not been purchased yet
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Indicates whether the item has been purchased
    purchased = models.BooleanField(default=False)

    # Records the date and time when the item was purchased
    # This will be useful when later calculating monthly grocery shopping
    purchased_at = models.DateTimeField(null=True, blank=True)

    # Automatically records when the grocery item was created.
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        """
        Validate the grocery item before it is saved.
        The main business rule is:
        An item cannot be marked as purchased unless a price has been entered.
        """
        if self.purchased and self.price is None:
            raise ValidationError({
                "price": "You must enter a price before marking this item as purchased."
            })

        # If the item has not been purchased, it should not have a purchase date
        if not self.purchased and self.purchased_at is not None:
            raise Validation({
                "purchased_at": "An item that has not been purchased cannot have a purchase date."
            })


    def save(self, *args, **kwargs):
        """
        Control what happens when a GroceryItem is saved.

        We automatically set purchased_at when an item
        becomes purchased and clear it when an item becomes unpurchased.
        """

        # If the item is being marked as purchased,
        # record the current date and time
        if self.purchased:
            if self.purchased_at is None:
                self.purchased_at = timezone.now()
        else:
            self.purchased_at = None

        # Run our validation rules before saving
        self.full_clean()

        # Finally, save the object to the database
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class MonthlyBudget(models.Model):
    # Each budget belongs to one user
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="monthly_budgets"
    )

    # The month the budget applies to.
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()

    # The maximum amount the user plans to spend
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Each user can have only one budget per month
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "year", "month"],
                name="unique_user_monthly_budget"
            )
        ]

    def clean(self):
        from django.core.exceptions import ValidationError

        if not 1 <= self.month <= 12:
            raise ValidationError({
                "month": "Month must be between 1 and 12."
            })

        if self.amount <= 0:
            raise ValidationError({
                "amount": "Budget must be greater than zero."
            })

    def __str__(self):
        return (
            f"{self.owner.username} - "
            f"{self.year}-{self.month:02d} budget"
        )


from .google_auth_models import GoogleAccount
