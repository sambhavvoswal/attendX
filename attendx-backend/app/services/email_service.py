"""
AttendX — Email Service
Sends transactional emails via Resend API.
"""
import resend
from app.config import get_settings


def _init_resend():
    settings = get_settings()
    resend.api_key = settings.RESEND_API_KEY


def send_approval_email(user_email: str, user_name: str):
    """Send account approval notification email."""
    _init_resend()
    settings = get_settings()

    resend.Emails.send({
        "from": "AttendX <onboarding@resend.dev>",
        "to": [user_email],
        "subject": "Your AttendX Account Has Been Approved ✅",
        "html": f"""
        <h2>Welcome to AttendX, {user_name}!</h2>
        <p>Your account has been approved. You can now log in and start managing attendance.</p>
        <p><a href="{settings.FRONTEND_URL}/login"
              style="display:inline-block;padding:12px 24px;background:#f97066;color:#fff;
                     border-radius:8px;text-decoration:none;font-weight:600;">
            Log In Now
        </a></p>
        <p style="color:#94a3b8;font-size:14px;">— The AttendX Team</p>
        """,
    })


def send_rejection_email(user_email: str, user_name: str, reason: str | None = None):
    """Send account rejection notification email."""
    _init_resend()

    reason_text = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""

    resend.Emails.send({
        "from": "AttendX <onboarding@resend.dev>",
        "to": [user_email],
        "subject": "AttendX Account Request Update",
        "html": f"""
        <h2>Hi {user_name},</h2>
        <p>Your request to join AttendX was not approved at this time.</p>
        {reason_text}
        <p>If you believe this was a mistake, please contact your organization admin.</p>
        <p style="color:#94a3b8;font-size:14px;">— The AttendX Team</p>
        """,
    })
