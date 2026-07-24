# Email Functionality Implementation Guide

## Overview

Email functionality has been successfully implemented in your Employee Management System. When an organization admin creates a new employee, an automated welcome email is sent to the employee with their login credentials and a direct link to access the system.

## What Was Implemented

### 1. **Email Service Module** (`app/service/email_service.py`)

- Configured SMTP connection using your Gmail credentials
- Two main functions:
  - `send_employee_welcome_email()` - Sends personalized welcome emails to new employees
  - `send_test_email()` - Test endpoint to verify SMTP configuration

### 2. **Configuration Updates** (`app/core/config.py`)

Added email settings loaded from `.env`:

- `SMTP_SERVER` - SMTP server address
- `SMTP_PORT` - SMTP port number
- `SMTP_USERNAME` - Email account username
- `SMTP_PASSWORD` - Email account password
- `MAIL_FROM_ADDRESS` - Sender email address
- `MAIL_FROM_NAME` - Sender display name
- `SMTP_USE_TLS` - TLS encryption flag
- `SMTP_USE_SSL` - SSL encryption flag
- `FRONTEND_URL` - Frontend URL for login links in emails

### 3. **User Service Integration** (`app/service/user_service.py`)

Updated `create_user()` function to:

- Send welcome email automatically when creating an employee
- Include plain text password in the email (before hashing)
- Handle email sending errors gracefully without blocking user creation

### 4. **API Endpoint** (`app/routes/user_routes.py`)

Added test email endpoint:

- `POST /users/test-email/{recipient_email}` - Send test email to verify SMTP configuration

### 5. **Environment Configuration** (`.env`)

Added `FRONTEND_URL` setting for the login link in emails

## Email Template Features

The welcome email includes:

- ✅ Professional HTML design with gradient header
- ✅ Employee name personalization
- ✅ Login credentials (email and password)
- ✅ Direct login button linking to your frontend
- ✅ System features information
- ✅ Security warning about changing password on first login
- ✅ Professional footer

## Current Email Credentials in `.env`

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=shivam.samyotech@gmail.com
SMTP_PASSWORD=ycyh kujx zyfl tyty
MAIL_FROM_ADDRESS=shivam.samyotech@gmail.com
SMTP_USE_TLS=true
SMTP_USE_SSL=false
FRONTEND_URL=http://localhost:5173
```

## How It Works

### Employee Creation Flow

1. Organization Admin/HR Manager/Department Admin creates a new employee
2. System stores employee data in the database
3. **Automatically** sends welcome email with:
   - Employee's email address
   - Temporary password
   - Login button with frontend URL
   - List of system features
   - Security recommendations

### Email Sending Process

- Email is sent asynchronously (non-blocking)
- Does NOT delay employee creation
- Errors in email sending are logged but don't affect user creation
- Emails are only sent for employees, not for admins or other roles

## Testing the Email Functionality

### Option 1: Test Email Endpoint

```bash
POST http://localhost:8000/users/test-email/your-email@example.com
```

Headers:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Response:

```json
{
  "success": true,
  "message": "Test email sent successfully to your-email@example.com"
}
```

### Option 2: Create an Employee

1. Login as Organization Admin/HR Manager/Department Admin
2. Create a new employee through the system
3. Check the employee's email for the welcome message

## Important Notes

### Gmail Specific Setup

For Gmail to work with the current setup:

1. The password in `.env` is an **App Password** (not your regular Gmail password)
2. You need to enable "Less secure app access" or use App Passwords
3. Gmail requires App Passwords for SMTP connections

### Email Security

- Passwords are temporarily stored in memory only for email sending
- Passwords are never logged or stored in the database in plain text
- Emails are sent over TLS encrypted connection
- Consider implementing additional security:
  - Password expiration policies
  - Email verification before first login
  - OTP for additional security

## Customizing the Email

To customize the email template, edit the HTML template in `app/service/email_service.py`:

```python
async def send_employee_welcome_email(
    employee_email: str,
    employee_name: str,
    employee_password: str,
    frontend_url: str = "http://localhost:5173"
):
    # Edit the html_template variable to customize the email
    html_template = """
    <!-- Your custom HTML here -->
    """
```

## Frontend Integration

The email includes a button linking to:

```
http://localhost:5173/login
```

Make sure your frontend:

1. Has a login page at the `/login` route
2. Accepts email and password from the email
3. Handles the initial password change flow
4. Displays success/error messages appropriately

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials** - Verify username and password are correct
2. **Check port** - Port 587 (TLS) vs 465 (SSL)
3. **Gmail App Password** - Make sure you're using App Password, not regular password
4. **Two-factor authentication** - Gmail requires 2FA for App Passwords
5. **Check logs** - Look for error messages in terminal output

### Test Email Endpoint Returns 500 Error

```python
# Check if this error appears in logs:
# "Error sending welcome email: SMTP connection failed"
# Solutions:
# 1. Verify internet connection
# 2. Verify SMTP credentials in .env
# 3. Check if Gmail account has 2FA enabled
# 4. Generate new App Password in Gmail settings
```

### Emails Going to Spam

1. Check spam folder first
2. Add sending email to contacts
3. Consider using a domain-specific email instead of Gmail
4. Implement email authentication (SPF, DKIM, DMARC)

## Advanced Customizations

### Sending Different Emails for Different Roles

Edit `user_service.py` to check user role and send different templates:

```python
if user.role == RoleEnum.EMPLOYEE:
    await send_employee_welcome_email(...)
elif user.role == RoleEnum.ORGANIZATION_ADMIN:
    await send_admin_welcome_email(...)
```

### Adding Attachments

Update `email_service.py` to include attachments:

```python
message = MessageSchema(
    subject="...",
    recipients=[...],
    html=html_content,
    subtype="html",
    attachments=[{"filename": "guide.pdf", "data": file_content}]
)
```

### Scheduled Email Reminders

Create a background task to send periodic emails:

```python
from fastapi_utils.tasks import repeat_every

@repeat_every(seconds=86400)  # Daily
async def send_daily_reminders():
    # Send emails to users with pending tasks
```

## Files Modified/Created

1. ✅ `app/service/email_service.py` - NEW
2. ✅ `app/core/config.py` - UPDATED
3. ✅ `app/service/user_service.py` - UPDATED
4. ✅ `app/routes/user_routes.py` - UPDATED
5. ✅ `.env` - UPDATED

## Next Steps (Optional Enhancements)

1. **Email Verification** - Send verification link to confirm email
2. **Password Reset Emails** - Forgot password functionality
3. **Attendance Notifications** - Send daily attendance reminders
4. **Leave Approval Emails** - Notify about leave requests/approvals
5. **Email Templates** - Use database-stored templates for flexibility
6. **Email History** - Log all sent emails for audit trail
7. **Bulk Emails** - Send to multiple employees at once
8. **Email Scheduling** - Schedule emails for later delivery

---

**Implementation Date**: July 16, 2024
**Status**: ✅ Ready for Testing
