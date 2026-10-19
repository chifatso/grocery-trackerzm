from django.contrib import admin
from .models import GroceryList, GroceryItem, MonthlyBudget

# Register your models here so we can manage the items through the django admin panel.

admin.site.register(GroceryList)
admin.site.register(GroceryItem)
admin.site.register(MonthlyBudget)
