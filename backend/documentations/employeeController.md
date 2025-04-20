
# 📘 Employee Controller Documentation

This documentation provides an overview of the API functionality for sending contact messages to admin users.

---

## 📁 Endpoints

### 1. 📧 Send Contact Message to Admins

**Endpoint:**  
`POST /api/employees/contact-admin`

**Description:**  
Sends an email message with specified subject and body from a employee account to **all employees with the `admin` role** in the system via gmail service.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                   |
| --------- | ------ | -------- | --------------------------------------------- |
| subject   | string | ✅ Yes   | Subject line of the message                   |
| message   | string | ✅ Yes   | Body of the message to be sent                |
| email     | string | ✅ Yes   | Email address of the sender (contact form)    |

**Example Request JSON:**
```json
{
  "subject": "Technical Issue",
  "message": "I'm facing login issues with my account.",
  "email": "user@example.com"
}
```

**Success Response:**
- `200 OK`: Emails have been sent successfully to all admin users.
```json
{
  "message": "Email sent successfully"
}
```

**Failure Responses:**
- `500 Internal Server Error`: If something goes wrong during fetching admin emails or while sending messages.
```json
{
  "message": "Failed to send email",
  "error": "Error message here"
}
```

---

## 🛠️ Developer Notes

- Uses `Employee` model to query all users with the `admin` role (`{ role: 'admin' }`).
- Selects only the `email` field of admins to avoid unnecessary data fetching.
- Iterates through each admin and sends a separate email using the `sendMessage(subject, message, senderEmail, recipientEmail)` function from `sendMail.js`.
- Proper logs are printed to trace request data, admin recipients, and the sending process.
- Built-in `try-catch` block handles and logs errors gracefully.

---

## ⚙️ Technologies Used

- **Node.js**
- **Express.js**
- **Mongoose (MongoDB)** - For employee data retrieval
- **Custom Mail Utility (`sendMail.js`)** - For dispatching emails via configured transporter (Nodemailer)
