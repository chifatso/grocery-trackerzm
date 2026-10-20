
import os

import resend
from django.core.mail.backends.base import BaseEmailBackend


class ResendEmailBackend(BaseEmailBackend):
    """
    Send Django emails using Resend's HTTPS API.
    """

    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        api_key = os.getenv("RESEND_API_KEY")

        if not api_key:
            raise ValueError("RESEND_API_KEY is not configured.")

        resend.api_key = api_key
        sent_count = 0

        for message in email_messages:
            if not message.recipients():
                continue

            params = {
                "from": message.from_email,
                "to": message.to,
                "subject": message.subject,
                "text": message.body,
            }

            if message.cc:
                params["cc"] = message.cc

            if message.bcc:
                params["bcc"] = message.bcc

            # Send email through Resend's HTTPS API.
            resend.Emails.send(params)
            sent_count += 1

        return sent_count
