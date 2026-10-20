import os
import logging
import resend

from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)


class ResendEmailBackend(BaseEmailBackend):
    """
    Send Django emails using the Resend HTTPS API.
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

            try:
                response = resend.Emails.send(params)

                sent_count += 1

                logger.info(
                    "Resend accepted email request successfully."
                )

            except Exception:
                logger.exception(
                    "Resend email delivery request failed."
                )

                if not self.fail_silently:
                    raise

        return sent_count