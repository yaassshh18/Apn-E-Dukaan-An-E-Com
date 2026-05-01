import logging
import threading

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    """Raised when an OTP (or critical) email could not be sent."""


def _from_email():
    return getattr(settings, "DEFAULT_FROM_EMAIL", None) or settings.EMAIL_HOST_USER


def _send_html_email_sync(subject, template_name, context, recipient_list):
    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=_from_email(),
        to=recipient_list,
    )
    email.attach_alternative(html_content, "text/html")
    try:
        email.send(fail_silently=False)
    except Exception as e:
        logger.exception("SMTP send failed to %s (backend=%s)", recipient_list, settings.EMAIL_BACKEND)
        raise EmailDeliveryError(
            "We could not send the email. If you are the server admin: use a real Gmail App Password "
            "in EMAIL_HOST_PASSWORD, check EMAIL_HOST / port (587 + TLS or 465 + EMAIL_USE_SSL=true), "
            "firewall, and try EXPOSE_OTP_IN_API=true for local testing. Recipients should check Spam."
        ) from e


class EmailThread(threading.Thread):
    def __init__(self, email_msg):
        self.email_msg = email_msg
        threading.Thread.__init__(self)

    def run(self):
        try:
            self.email_msg.send()
        except Exception:
            logger.exception("Failed to send email to %s", self.email_msg.to)


def send_html_email(subject, template_name, context, recipient_list):
    """
    Renders an HTML template with context and sends it via email asynchronously.
    Use for non-critical mail (welcome, alerts). OTP mail uses sync send instead.
    """
    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=_from_email(),
        to=recipient_list,
    )
    email.attach_alternative(html_content, "text/html")
    EmailThread(email).start()


def send_registration_otp(email, otp_code):
    subject = "Verify your Apn-E-Dukaan account"
    context = {
        "otp_code": otp_code,
        "action": "registration",
    }
    _send_html_email_sync(subject, "emails/registration_otp.html", context, [email])


def send_welcome_email(email, username):
    subject = "Welcome to Apn-E-Dukaan 🎉"
    context = {
        "username": username,
    }
    send_html_email(subject, "emails/welcome.html", context, [email])


def send_login_otp(email, otp_code):
    subject = "Your Login OTP - Apn-E-Dukaan"
    context = {
        "otp_code": otp_code,
        "action": "login",
    }
    _send_html_email_sync(subject, "emails/login_otp.html", context, [email])


def send_login_alert(email, username, ip_address, device, time):
    subject = "Successful Login Alert - Apn-E-Dukaan"
    context = {
        "username": username,
        "ip_address": ip_address,
        "device": device,
        "time": time,
    }
    send_html_email(subject, "emails/login_alert.html", context, [email])


def send_password_reset_otp(email, otp_code):
    subject = "Password Reset OTP - Apn-E-Dukaan"
    context = {
        "otp_code": otp_code,
    }
    _send_html_email_sync(subject, "emails/password_reset_otp.html", context, [email])
