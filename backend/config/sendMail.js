import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export const sendPasswordEmail = async (toEmail, password, role = "Patient", id = null) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  let idBlock = '';
  if (id) {
    idBlock = `<p><strong>Your ${role} ID:</strong> ${id}</p>`;
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Your ${role} Portal Password`,
    html: `<p>Hello,</p>
           <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
           ${idBlock}
           <p>Here is your password:</p>
           <h3 style="color: teal;">${password}</h3>
           <p>Please change it after logging in for security reasons.</p>
           <p><strong>To Change Password:</strong><br>
           Go to the login screen, click on "Forgot Password", and enter your email ID.<br>
           You will receive a link on your registered email to change your password.</p>`
  };

  await transporter.sendMail(mailOptions);
};


export const sendAssignmentEmail = async ({ toEmail, name, bedNo, roomNumber, role,id }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.USER,
    to: toEmail,
    subject: `Bed Assignment Notification - ${role}`,
    html: `<p>Dear ${name} (${id}),</p>
           <p>You have been assigned to <strong>BedNo ${bedNo}</strong> in <strong>RoomNo ${roomNumber}</strong> as a <strong>${role}</strong>.</p>
           <p>Please report accordingly. If you have questions, contact the reception.</p>
           <p>Thank you!</p>`
  };

  await transporter.sendMail(mailOptions);
};

export const sendDischargeEmail = async ({ toEmail, name, bedNo, roomNumber, role,id }) => {
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
    subject: `Discharge Notification from Hospital`,
    html: `<p>Hello ${name} (${id}),</p>
           <p>This is to inform you that you have been <strong>discharged</strong> from your assigned bed as a <strong>${role}</strong>.</p>
           <ul>
             <li><strong>Bed ID:</strong> ${bedNo}</li>
             <li><strong>Room Number:</strong> ${roomNumber}</li>
           </ul>
           <p>If you have any further queries or need assistance, feel free to contact the hospital administration.</p>
           <p>Wishing you a speedy recovery and good health!</p>
           <br/>
           <p>Regards,<br>Hospital Management</p>`
  };

  await transporter.sendMail(mailOptions);
};

export const appointmentEmail = async ({ toEmail, patient_name, patient_id,doctor_id,reason,appointment_type,booked_date_time }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to:toEmail,
    subject: `New Consultation Booking`,
    html: `<p>Hello ${patient_name} (${patient_id}),</p>
           <p>This is to inform you that your consultation has been successfully booked.</p>
           <ul>
           <li><strong>Doctor:</strong> ${doctor_id}</li>
             <li><strong>Appointment Date and Time:</strong>  ${new Date(booked_date_time).toLocaleString()}</li>
             <li><strong>Reason:</strong> ${reason}</li>
             <li><strong>Appointment Type:</strong> ${appointment_type}</li>
           </ul>
           <p>If you have any further queries or need assistance, feel free to contact the hospital administration.</p>
           <p>Wishing you the best health!</p>
           <br/>
           <p>Regards,<br>Hospital Management</p>`
  };

  await transporter.sendMail(mailOptions);

};

export const updateAppointmentEmail = async ({ toEmail, name, patient_id, doctor_id, reason, appointment_type, booked_date_time }) => {
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
    subject: `Consultation Appointment Updated`,
    html: `<p>Hello ${name} (${patient_id}),</p>
           <p>Your consultation appointment has been <strong>updated</strong> with the following details:</p>
           <ul>
             <li><strong>Doctor ID:</strong> ${doctor_id}</li>
             <li><strong>Appointment Date & Time:</strong> ${new Date(booked_date_time).toLocaleString()}</li>
             <li><strong>Reason:</strong> ${reason}</li>
             <li><strong>Appointment Type:</strong> ${appointment_type}</li>
           </ul>
           <p>Please reach out to the hospital staff for any changes or assistance.</p>
           <br/>
           <p>Regards,<br/>Hospital Management</p>`
  };

  await transporter.sendMail(mailOptions);
};



export const sendMessage = async (sub='',message='',fromEmail,toEmail) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: sub,
    html: `
    <h3>Message from: ${fromEmail}</h3>
    <p>${message}</p>
    `
  };

  await transporter.sendMail(mailOptions);

};

