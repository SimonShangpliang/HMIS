
# 📘 Auth Controller Documentation

This documentation provides an overview of the API functionality related to user authentication and password management.

---

## 📁 Endpoints

### 1. 🔐 Login

**Endpoint:**  
`POST /api/auth/login`

**Description:**  
Authenticates a user (patient or employee) based on email and password. Returns an access token and sets a refresh token in cookies.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| email     | string | ✅ Yes   | Email address of the user            |
| password  | string | ✅ Yes   | User password                        |
| userType  | string | ✅ Yes   | `patient` or `employee`              |

**Success Response:**
- `200 OK`: Returns access token and user info
```json
{
  "accessToken": "jwt_token_here",
  "role": "admin",
  "user": { ... }
}
```

**Failure Responses:**
- `400 Bad Request`: Invalid credentials
- `500 Internal Server Error`: On server failure

---

### 2. 🔄 Refresh Access Token

**Endpoint:**  
`GET /api/auth/refresh-token`

**Description:**  
Generates a new access token using a valid refresh token stored in cookies.

**Cookies Required:**
- `refreshToken` (HTTP-only)

**Success Response:**
- `200 OK`: Returns new access token
```json
{
  "accessToken": "new_jwt_token_here"
}
```

**Failure Responses:**
- `401 Unauthorized`: If no refresh token is found
- `403 Forbidden`: If the refresh token is invalid

---

### 3. 📧 Forgot Password

**Endpoint:**  
`POST /api/auth/forgot-password`

**Description:**  
Sends a password reset email to the user with a reset token link.

**Request Body Parameters:**

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| email     | string | ✅ Yes   | Email of the user       |
| userType  | string | ✅ Yes   | `patient` or `employee` |

**Success Response:**
- `200 OK`: Reset link sent
```json
{
  "message": "Reset link sent to your email."
}
```

**Failure Responses:**
- `404 Not Found`: If no user is associated with email
- `500 Internal Server Error`: On failure during token creation or email sending

---

### 4. 🔑 Reset Password

**Endpoint:**  
`POST /api/auth/reset-password/:token`

**Description:**  
Resets the user password using the token from the password reset email.

**Route Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| token     | string | ✅ Yes   | Reset token from email          |

**Request Body Parameters:**

| Parameter | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| password  | string | ✅ Yes   | New password to set  |

**Success Response:**
- `200 OK`: Password reset successfully
```json
{
  "message": "Password has been reset."
}
```

**Failure Responses:**
- `400 Bad Request`: Invalid or expired token
- `404 Not Found`: User not found
- `500 Internal Server Error`: On server failure

---

### 5. 🚪 Logout

**Endpoint:**  
`POST /api/auth/logout`

**Description:**  
Logs out the user by clearing the refresh token cookie.

**Success Response:**
- `200 OK`: Logout successful
```json
{
  "message": "Logged out successfully"
}
```

**Failure Responses:**
- `500 Internal Server Error`: On failure to clear cookie

---

## ⚙️ Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB with Mongoose**
- **bcryptjs** - For password hashing
- **jsonwebtoken** - For access and refresh tokens
- **nodemailer** - For sending reset email
- **crypto** - To generate secure tokens
- **Redis** - For temporary token storage

---

## 🛠️ Developer Notes

- JWT tokens are used for authentication with separate secrets for access and refresh tokens.
- Password reset tokens expire in 15 minutes (`900` seconds) and are stored in Redis.
- All routes are designed to be compatible with both Patient and Employee user models.
- Refresh token is stored in a secure HTTP-only cookie with Lax policy.
