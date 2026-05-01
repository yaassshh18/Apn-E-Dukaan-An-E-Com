import hashlib
import random
import string
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from users.models import OTP


def dev_otp_response(otp_code):
    """
    When EXPOSE_OTP_IN_API is True, attach the raw OTP to API JSON (local/dev only).
    """
    if not otp_code or not getattr(settings, "EXPOSE_OTP_IN_API", False):
        return {}
    return {
        "dev_otp": otp_code,
        "dev_note": (
            "This OTP is included for development. For real email delivery, set "
            "EMAIL_HOST_USER, EMAIL_HOST_PASSWORD (Gmail: use an App Password), and "
            "USE_SMTP_EMAIL=true in backend/.env."
        ),
    }

def generate_otp_code(length=6):
    """Generate a random numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))

def hash_otp(otp_code):
    """Hash the OTP before storing."""
    return hashlib.sha256(otp_code.encode()).hexdigest()

def create_otp_for_email(email):
    """
    Invalidates any existing unused OTPs for the email,
    generates a new one, saves it hashed, and returns the raw OTP.
    """
    # Invalidate older ones
    OTP.objects.filter(email=email, is_verified=False).update(is_verified=True)

    # Generate new
    raw_otp = generate_otp_code()
    hashed_otp = hash_otp(raw_otp)
    expiry_time = timezone.now() + timedelta(minutes=5)
    
    OTP.objects.create(
        email=email,
        otp_code=hashed_otp,
        expiry_time=expiry_time
    )
    
    return raw_otp

def verify_otp(email, provided_otp):
    """
    Verifies the OTP for the given email.
    Returns (True, "Success message") or (False, "Error message")
    """
    try:
        otp_record = OTP.objects.filter(email=email, is_verified=False).latest('created_at')
    except OTP.DoesNotExist:
        return False, "No active OTP found for this email."

    if timezone.now() > otp_record.expiry_time:
        return False, "OTP has expired."

    if otp_record.attempts >= 5:
        # Invalidate due to too many attempts
        otp_record.is_verified = True
        otp_record.save()
        return False, "Too many failed attempts. Please request a new OTP."

    if otp_record.otp_code != hash_otp(provided_otp):
        otp_record.attempts += 1
        otp_record.save()
        remaining = 5 - otp_record.attempts
        return False, f"Invalid OTP. {remaining} attempts remaining."

    # Success
    otp_record.is_verified = True
    otp_record.save()
    return True, "OTP verified successfully."
