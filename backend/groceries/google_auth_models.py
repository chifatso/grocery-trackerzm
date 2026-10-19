from django.conf import settings
from django.db import models

class GoogleAccount(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="google_account",
    )

    google_sub = models.CharField(
        max_length=255,
        unique=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Google account for {self.user.username}"