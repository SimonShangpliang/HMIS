import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export const sendPasswordEmail = async (toEmail, password, role = "Patient") => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Your ${role} Portal Password`,
    html: `<p>Hello,</p>
           <p>Your account has been created successfully as a <strong>${role}</strong>. Here is your password:</p>
           <h3 style="color: teal;">${password}</h3>
           <p>Please change it after logging in for security reasons.</p>
           <p><strong>To Change Password:</strong><br>
           Go to the login screen, click on "Forgot Password", and enter your email ID.<br>
           You will receive a link on your registered email to change your password.</p>`
  };

  await transporter.sendMail(mailOptions);
};
