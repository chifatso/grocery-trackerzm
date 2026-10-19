from decimal import Decimal
from datetime import date

from django.db.models import Sum

from .models import GroceryItem

def get_monthly_spending(user, year, month):
    """
    Calculate the total amount spent on groceries
    during a specific month.

    Only items that have actually been purchased are included.
    """

    # Find all purchased grocery items that were
    # purchased during the requested year and month
    items = GroceryItem.objects.filter(
        grocery_list__owner = user,
        purchased = True,
        purchased_at__year = year,
        purchased_at__month = month
    )

    # Add all prices together
    # Sum("price") returns None if there are no matching items, so we use Decimal("0.00") in that case.
    total = items.aggregate(
        total = Sum("price")
    )["total"] or Decimal("0.00")

    # Count how many items were purchased
    items_purchased = items.count()

    return {
        "total": total,
        "items_purchased": items_purchased,
    }


def get_previous_month(year, month):
    """
    Calculate the year and month immediately before
    the given year and month
    """

    # If the current month is January
    # the previous month is december of the previous year
    if month == 1:
        return year - 1, 12

    # Otherwise, simply subtract one from the month
    return year, month - 1

def compare_months(user, year, month):
    """
    Compare spending between the requested month
    and the previous month.
    """

    # Get the previous month.
    previous_year, previous_month = get_previous_month(
        year,
        month
    )

    # Calculate current month spending
    current = get_monthly_spending(
        user,
        year,
        month
    )

    # calculate previous month spending
    previous = get_monthly_spending(
        user,
        previous_year,
        previous_month
    )

    # Calculate the difference between the two months
    difference = current["total"] - previous["total"]

    # Calculate percentage change
    # We need to avoid dividing by zero when the previous month has no spending
    if previous["total"] > 0:
        percentage_change = (
            difference / previous["total"]
        ) * 100
    else:
        percentage_change = None

    return {
        "current": current,
        "previous": previous,
        "difference": difference,
        "percentage_change": percentage_change,
    }
