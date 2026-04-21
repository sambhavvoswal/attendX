import resend
from app.config import settings
from typing import Optional
import html

def _ensure_resend_init():
    if settings.RESEND_API_KEY:
        resend.api_key = settings.RESEND_API_KEY

def send_approval_email(to_email: str, org_name: str, role: str) -> Optional[dict]:
    """Sends an email notifying the user they were approved to join an organization."""
    if not settings.RESEND_API_KEY:
        print(f"[EmailService] Skipping approval email to {to_email}. No RESEND_API_KEY configured.")
        return None
        
    _ensure_resend_init()
    
    safe_org = html.escape(org_name)
    safe_role = html.escape(role)
    
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">AttendX Access Approved!</h2>
        <p>Hello,</p>
        <p>Your request to join <strong>{safe_org}</strong> has been officially approved by the administrator.</p>
        <p>You have been assigned the role of <strong>{safe_role}</strong>.</p>
        <p>You can now log into your AttendX dashboard to manage your attendance sheets.</p>
        <br />
        <p><a href="{settings.FRONTEND_URL}/login" style="background-color: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Login to AttendX</a></p>
    </div>
    """
    
    try:
        r = resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": to_email,
            "subject": f"Approved: Welcome to {org_name} on AttendX",
            "html": html_content
        })
        print(f"[EmailService] Sent approval email to {to_email}")
        return r
    except Exception as e:
        print(f"[EmailService] Failed to send email to {to_email}: {str(e)}")
        return None

def send_rejection_email(to_email: str, org_name: str) -> Optional[dict]:
    """Sends an email notifying the user they were rejected from joining an organization."""
    if not settings.RESEND_API_KEY:
        print(f"[EmailService] Skipping rejection email to {to_email}. No RESEND_API_KEY configured.")
        return None
        
    _ensure_resend_init()
    
    safe_org = html.escape(org_name)
    
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #ef4444;">AttendX Access Denied</h2>
        <p>Hello,</p>
        <p>Your request to join <strong>{safe_org}</strong> was declined by the administrator.</p>
        <p>If you believe this was a mistake, please contact your organization administrator directly, or try signing up again using the correct Organization ID.</p>
    </div>
    """
    
    try:
        r = resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": to_email,
            "subject": f"Update on your request to join {org_name}",
            "html": html_content
        })
        print(f"[EmailService] Sent rejection email to {to_email}")
        return r
    except Exception as e:
        print(f"[EmailService] Failed to send email to {to_email}: {str(e)}")
        return None
