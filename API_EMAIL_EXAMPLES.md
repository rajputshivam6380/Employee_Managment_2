# Email Implementation - API Examples

## 📧 Automatic Email Sending Flow

### When Creating an Employee

**Endpoint:**

```
POST http://localhost:8000/users/add-user
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "role": "employee",
  "country_code": "+1",
  "department": "IT"
}
```

**Headers:**

```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Response (201 Created):**

```json
{
  "id": 5,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "role": "employee",
  "country_code": "+1",
  "department": "IT",
  "is_active": true,
  "parent_id": 1
}
```

**✉️ EMAIL SENT AUTOMATICALLY TO:** john.doe@example.com

- Contains: email, password, login button

---

## 🧪 Testing Email Functionality

### Option 1: Test SMTP Connection

**Endpoint:**

```
POST http://localhost:8000/users/test-email/your-email@example.com
```

**Headers:**

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Test email sent successfully to your-email@example.com"
}
```

---

## 🛠️ Using with Frontend (React)

### Example: Create Employee Form with Email Notification

```jsx
// AddEmployee.jsx
import { useState } from "react";
import axios from "axios";

function AddEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "employee",
    department: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/users/add-user",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.status === 200) {
        alert(
          `Employee created successfully! Welcome email sent to ${formData.email}`,
        );
        // Reset form or redirect
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Failed to create employee");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />

      <select
        value={formData.department}
        onChange={(e) =>
          setFormData({ ...formData, department: e.target.value })
        }
        required
      >
        <option value="">Select Department</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
      </select>

      <button type="submit">Create Employee & Send Welcome Email</button>
    </form>
  );
}

export default AddEmployee;
```

---

## 📨 What Employee Receives

### Email Subject:

```
Welcome to Employee Management System - Your Login Credentials
```

### Email Body (HTML):

Includes:

- Welcome message with name
- Email: john.doe@example.com
- Password: SecurePassword123!
- **[Login to Your Account]** button → http://localhost:5173/login
- System features list
- Security warning about changing password
- Footer with company info

---

## ⚙️ Backend Flow (Python)

### user_service.py - create_user() Function

```python
async def create_user(db: Session, user_data: UserCreate, current_user):
    # ... validation checks ...

    hashed_password = hash_password(user_data.password)

    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        phone=user_data.phone,
        role=user_data.role,
        country_code=user_data.country_code,
        department=user_data.department,
        parent_id=parent_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # ✉️ SEND EMAIL (only for employees)
    if user.role == RoleEnum.EMPLOYEE:
        try:
            asyncio.create_task(
                send_employee_welcome_email(
                    employee_email=user.email,
                    employee_name=user.name,
                    employee_password=user_data.password,  # Plain text for email
                    frontend_url=settings.FRONTEND_URL
                )
            )
        except Exception as e:
            print(f"Error sending email: {str(e)}")

    return user
```

---

## 🔄 Using Postman to Test

### Step 1: Get Admin Access Token

**POST** `/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "admin_password"
}
```

### Step 2: Create Employee with Token

**POST** `/users/add-user`

Headers:

```
Authorization: Bearer YOUR_TOKEN_FROM_STEP_1
```

Body:

```json
{
  "name": "Test Employee",
  "email": "test@example.com",
  "password": "TestPass123!",
  "phone": "+1234567890",
  "role": "employee",
  "country_code": "+1",
  "department": "IT"
}
```

### Step 3: Test Email Functionality

**POST** `/users/test-email/your-test-email@gmail.com`

Headers:

```
Authorization: Bearer YOUR_TOKEN
```

---

## 🐛 Debugging Email Issues

### 1. Check if email was sent

Look for this in backend logs:

```
INFO: Email sent successfully to employee@example.com
```

### 2. If no email received

- Check spam/junk folder
- Verify email address is correct
- Check recipient email exists and is valid

### 3. SMTP Connection Error

Check `.env` file:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=correct-email@gmail.com
SMTP_PASSWORD=app-password-not-regular-password
```

### 4. Gmail App Password Setup

1. Enable 2FA on Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate new app password
4. Update `.env` with the 16-character password

---

## 📊 Email Sending Statistics (Future Enhancement)

Track email sending:

```python
# Pseudo-code for future implementation
async def send_email_with_logging(email, user_data):
    try:
        await send_employee_welcome_email(...)
        log_email_sent(user_id=user_data.id, email=email, status='sent')
    except Exception as e:
        log_email_sent(user_id=user_data.id, email=email, status='failed', error=str(e))
```

---

## 🚀 Production Checklist

- [ ] Update SMTP credentials with production email account
- [ ] Change FRONTEND_URL to production domain
- [ ] Test email template rendering
- [ ] Set up email logging/monitoring
- [ ] Configure bounce/complaint handling
- [ ] Add unsubscribe option to emails
- [ ] Implement email rate limiting
- [ ] Set up email delivery confirmations
- [ ] Create backup email provider (SendGrid, AWS SES, etc.)
