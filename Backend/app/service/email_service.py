# app/service/email_service.py

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from jinja2 import Template

# Configure email connection
conf = ConnectionConfig(
    MAIL_SERVER=settings.SMTP_SERVER,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_FROM=settings.MAIL_FROM_ADDRESS,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_USERNAME=settings.SMTP_USERNAME,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_STARTTLS=settings.SMTP_USE_TLS,
    MAIL_SSL_TLS=settings.SMTP_USE_SSL,
)

fastmail = FastMail(conf)


async def send_employee_welcome_email(
    employee_email: str,
    employee_name: str,
    employee_password: str,
    frontend_url: str = "http://localhost:5173",
):
    """
    Send welcome email to newly created employee with login credentials

    Args:
        employee_email: Employee's email address
        employee_name: Employee's name
        employee_password: Employee's temporary password (plain text)
        frontend_url: URL to the frontend application
    """

    # HTML email template
    html_template = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Employee Management System</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                text-align: center;
                color: white;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .credentials-box {
                background-color: #f9f9f9;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .credential-item {
                margin: 10px 0;
                font-size: 14px;
            }
            .label {
                color: #666;
                font-weight: 600;
                display: inline-block;
                width: 100px;
            }
            .value {
                color: #333;
                font-family: 'Courier New', monospace;
                font-weight: 500;
            }
            .login-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 4px;
                margin: 20px 0;
                font-weight: 600;
                text-align: center;
            }
            .login-button:hover {
                opacity: 0.9;
            }
            .info-box {
                background-color: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                font-size: 14px;
                color: #1565c0;
            }
            .footer {
                background-color: #f5f5f5;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
            }
            .security-note {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                font-size: 13px;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to EMS</h1>
                <p>Employee Management System</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello <strong>{{ employee_name }}</strong>,
                </div>
                
                <p>Welcome to the Employee Management System! Your account has been created by your organization administrator. Below are your login credentials to access the system.</p>
                
                <div class="credentials-box">
                    <div class="credential-item">
                        <span class="label">Email:</span>
                        <span class="value">{{ employee_email }}</span>
                    </div>
                    <div class="credential-item">
                        <span class="label">Password:</span>
                        <span class="value">{{ employee_password }}</span>
                    </div>
                </div>
                
                <div class="security-note">
                    ⚠️ <strong>Important:</strong> Please change your password after your first login. This temporary password is for one-time use only.
                </div>
                
                <div class="info-box">
                    <strong>📌 System Features:</strong>
                    <ul>
                        <li>Track your attendance</li>
                        <li>Manage leave requests</li>
                        <li>View assigned projects</li>
                        <li>Update your profile</li>
                        <li>Access organization details</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <a href="{{ login_url }}" class="login-button">Login to Your Account</a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    If you face any issues logging in or have questions, please contact your administrator.
                </p>
            </div>
            
            <div class="footer">
                <p>© 2024 Employee Management System. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Render template
    template = Template(html_template)
    login_url = f"{frontend_url}/login"

    html_content = template.render(
        employee_name=employee_name,
        employee_email=employee_email,
        employee_password=employee_password,
        login_url=login_url,
    )

    # Create message
    message = MessageSchema(
        subject="Welcome to Employee Management System - Your Login Credentials",
        recipients=[employee_email],
        body=html_content,
        subtype="html",
    )

    # Send email
    await fastmail.send_message(message)


async def send_test_email(recipient_email: str):
    """Send a test email to verify SMTP configuration"""

    html_content = """
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Test Email</h2>
            <p>If you received this email, your SMTP configuration is working correctly!</p>
            <p>You can now proceed with the employee management system setup.</p>
        </body>
    </html>
    """

    message = MessageSchema(
        subject="Test Email - SMTP Configuration",
        recipients=[recipient_email],
        html=html_content,
        subtype="html",
    )

    await fastmail.send_message(message)
