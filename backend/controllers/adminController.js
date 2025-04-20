import pdf from 'pdfkit';
import fs from 'fs';
import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Payroll from '../models/payroll.js';
import Employee from '../models/employee.js'; // Import Employee model
import Medicine from '../models/inventory.js'; // Import Medicine model
import { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver } from '../models/staff.js'; // Import staff models
import FinanceLogs from '../models/logs.js'; // Import FinanceLogs model
import { sendPasswordEmail } from "../config/sendMail.js"; // adjust the path
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import Equipment from '../models/equipment.js';
import Department from '../models/department.js';
export const generatePayslip = async (req, res) => {
    try {
        const { employee_id } = req.body;
        const employee = await Employee.findById(employee_id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        const { salary: basic_salary, allowance, deduction, net_salary, month_year,email } = employee;
  
      // 1. Generate PDF in memory
      const doc = new PDFDocument();
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
  
        // 2. Configure Nodemailer transporter
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.USER,
            pass: process.env.PASS,
          }
        });
  
        // 3. Compose and send email with PDF as attachment
        await transporter.sendMail({
          from: '"Admin Department" hmis.iitg@gmail.com',
          to: email,
          subject: 'Your Monthly Payslip',
          text: 'Please find your payslip attached.',
          attachments: [
            {
              filename: `payslip_${employee_id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
  
    });
    
    // 5. Write PDF content
    doc.fontSize(20).text('Payslip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Employee ID: ${employee_id}`);
    doc.text(`Month/Year: ${new Date(month_year).toLocaleDateString()}`);
    doc.text(`Basic Salary: ${basic_salary}`);
    doc.text(`Allowance: ${allowance}`);
    doc.text(`Deduction: ${deduction}`);
    doc.text(`Net Salary: ${net_salary}`);
    doc.moveDown();
    doc.text('Thank you for your service!', { align: 'center' });
    
    doc.end(); // This triggers the 'end' event
    res.status(200).json({ message: 'Payslip generated and emailed successfully!' });
    
} catch (error) {
      console.error('Error sending payslip email:', error);
      res.status(500).json({ message: 'Failed to generate/send payslip', error });
    }
  };
const generatePayslipIn = async (req, res) => {
    try {
        const { employee_id } = req.body;
        const employee = await Employee.findById(employee_id);
        if (!employee) {
            // return res.status(404).json({ message: 'Employee not found' });
        }
        const { salary: basic_salary, allowance, deduction, net_salary, month_year,email } = employee;
  
      // 1. Generate PDF in memory
      const doc = new PDFDocument();
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
  
        // 2. Configure Nodemailer transporter
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.USER,
            pass: process.env.PASS,
          }
        });
  
        // 3. Compose and send email with PDF as attachment
        await transporter.sendMail({
          from: '"Admin Department" hmis.iitg@gmail.com',
          to: email,
          subject: 'Your Monthly Payslip',
          text: 'Please find your payslip attached.',
          attachments: [
            {
              filename: `payslip_${employee_id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
  
    });
    
    // 5. Write PDF content
    doc.fontSize(20).text('Payslip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Employee ID: ${employee_id}`);
    doc.text(`Month/Year: ${new Date(month_year).toLocaleDateString()}`);
    doc.text(`Basic Salary: ${basic_salary}`);
    doc.text(`Allowance: ${allowance}`);
    doc.text(`Deduction: ${deduction}`);
    doc.text(`Net Salary: ${net_salary}`);
    doc.moveDown();
    doc.text('Thank you for your service!', { align: 'center' });
    
    doc.end(); // This triggers the 'end' event
    // res.status(200).json({ message: 'Payslip generated and emailed successfully!' });
    
} catch (error) {
      console.error('Error sending payslip email:', error);
    //   res.status(500).json({ message: 'Failed to generate/send payslip', error });
    }
  };



export const searchEmployees = async (req, res) => { 
    try {
        console.log(req);
        const { searchQuery } = req.query;
        const searchKey = searchQuery;
        let searchKeyInt = parseInt(searchKey, 10);
        const employees = await Employee.find({
            $or: [
            { name: { $regex: searchKey, $options: 'i' } },
            { _id: !isNaN(searchKeyInt) ? searchKeyInt : undefined }
            ].filter(condition => condition._id  || condition.name)
        });
        console.log("in backend", searchKey, searchKeyInt, employees);
        res.status(200).json({ employees });
    } catch (error) {
        console.error('Error searching employees:', error);
        res.status(500).json({ message: 'Failed to search employees', error });
    }
};


export const updateInventory = async (req, res) => {
    try {
        const { 
            inventoryType = 'medicine',
            // Medicine fields
            medicineId, med_name, effectiveness, dosage_form, manufacturer, 
            batch_no, quantity, expiry_date, manufacturing_date, unit_price, supplier,
            // Equipment fields
            itemId, equipment_name, installation_date, last_service_date, next_service_date,
            // Common fields
            order_status = 'ordered'
        } = req.body;
        // Deduct the total cost from the hospital bank account
        const totalCost = unit_price * quantity;
        if (global.hospitalBankAccount.balance < totalCost) {
            return res.status(400).json({ message: 'Insufficient funds in hospital bank account' });
        }
        global.hospitalBankAccount.balance -= totalCost;
        if (inventoryType === 'medicine') {
            // Existing medicine validation and logic
            if (!batch_no || !quantity || !expiry_date || !manufacturing_date || !unit_price || !supplier) {
                return res.status(400).json({ message: 'Missing required inventory fields' });
            }

            // Additional validation for new medicine
            if (!medicineId && (!med_name || !effectiveness || !dosage_form || !manufacturer)) {
                return res.status(400).json({ message: 'Missing required medicine fields' });
            }

            // Validate dates
            const mfgDate = new Date(manufacturing_date);
            const expDate = new Date(expiry_date);
            
            if (mfgDate >= expDate) {
                return res.status(400).json({ message: 'Manufacturing date must be before expiry date' });
            }

            if (expDate <= new Date()) {
                return res.status(400).json({ message: 'Expiry date must be in the future' });
            }

            let medicine;
            if (medicineId) {
                medicine = await Medicine.findById(medicineId);
            }

            if (!medicine) {
                // Create new medicine with auto-incremented ID
                medicine = new Medicine({
                    med_name,
                    effectiveness,
                    dosage_form,
                    manufacturer,
                    available: true,
                    order_status,
                    inventory: [{
                        batch_no,
                        quantity,
                        expiry_date,
                        manufacturing_date,
                        unit_price,
                        supplier
                    }]
                });

                await medicine.save();
                return res.status(201).json({ 
                    message: 'New medicine added successfully', 
                    medicine,
                    isNewMedicine: true 
                });
            }

            // Update existing medicine's inventory
            const batchIndex = medicine.inventory.findIndex(batch => batch.batch_no === batch_no);

            if (batchIndex !== -1) {
                // Update existing batch
                medicine.inventory[batchIndex] = {
                    batch_no,
                    quantity,
                    expiry_date,
                    manufacturing_date,
                    unit_price,
                    supplier
                };
            } else {
                // Add new batch
                medicine.inventory.push({
                    batch_no,
                    quantity,
                    expiry_date,
                    manufacturing_date,
                    unit_price,
                    supplier
                });
            }

            // Update medicine manufacturer if provided
            if (manufacturer) medicine.manufacturer = manufacturer;

            // Update availability based on total quantity
            const totalQuantity = medicine.inventory.reduce((sum, batch) => sum + batch.quantity, 0);
            medicine.available = totalQuantity > 0;

            await medicine.save();
            res.status(200).json({ 
                message: 'Medicine inventory updated successfully', 
                medicine,
                isNewMedicine: false
            });

        } else {
            // Equipment validation
            if (!quantity) {
                return res.status(400).json({ message: 'Quantity is required' });
            }

            if (!itemId && (!equipment_name || !installation_date)) {
                return res.status(400).json({ message: 'Equipment name and installation date are required for new equipment' });
            }

            let equipment;
            if (itemId) {
                equipment = await Equipment.findById(itemId);
            }

            if (!equipment) {
                // Create new equipment
                equipment = new Equipment({
                    equipment_name,
                    quantity,
                    order_status,
                    installation_date,
                    last_service_date: installation_date, // Use installation date as first service date
                    next_service_date: next_service_date || new Date(new Date(installation_date).getTime() + 90*24*60*60*1000) // Default 90 days
                });

                await equipment.save();
                return res.status(201).json({
                    message: 'New equipment added successfully',
                    equipment,
                    isNewItem: true
                });
            }

            // Update existing equipment
            equipment.quantity = quantity;
            
            if (last_service_date) {
                equipment.last_service_date = last_service_date;
            }
            if (next_service_date) {
                equipment.next_service_date = next_service_date;
            }

            await equipment.save();
            return res.status(200).json({
                message: 'Equipment updated successfully',
                equipment,
                isNewItem: false
            });
        }

    } catch (error) {
        console.error('Error managing inventory:', error);
        res.status(500).json({ message: 'Failed to manage inventory', error });
    }
};

export const addStaff = async (req, res) => {
    try {
        const { 
            name, email,  role, dept_id, phone_number, emergency_phone, address, 
            date_of_birth, date_of_joining, gender, blood_group, salary, aadhar_id, bank_details, 
            basic_salary, allowance, deduction 
        } = req.body;
    
        const existingPatient = await Employee.findOne({ $or: [{ email }, { aadhar_number: aadhar_id }] });
        if (existingPatient) {
            return res.status(400).json({ message: 'Email or Aadhar ID already exists.' });
        }
        // Calculate age from date of birth
        const today = new Date();
        const birthDate = new Date(date_of_birth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }


        if(basic_salary < 0 || allowance < 0 || deduction < 0){
            return res.status(400).json({ message: 'Salary, allowance, and deduction must be non-negative.' });
        }
        const imageUrl=req.file?.path;
        // Hash the password
        let PlainPassword=crypto.randomBytes(8).toString('base64').slice(0, 8);
        const hashedPassword = await bcrypt.hash(PlainPassword, 10);
        // console.log(dept_id);
        // Create a new Employee document
        const newEmployee = new Employee({
            name,
            email,
            password: hashedPassword,
            profile_pic: imageUrl,
            role,
            dept_id,
            phone_number,
            emergency_contact:emergency_phone,
            address,
            date_of_birth,
            date_of_joining,
            gender,
            bloodGrp:blood_group,
            salary,
            aadhar_number: aadhar_id,
            bank_details
        });
        // console.log(newEmployee);

        // Save the employee to the database
        const savedEmployee = await newEmployee.save();
        await sendPasswordEmail(email,PlainPassword,role,savedEmployee._id);
        // Assign the employee to the appropriate role schema
        switch (role) {
            case 'doctor':
                const { specialization, qualification, experience, room_num } = req.body;
                await Doctor.create({
                    employee_id: savedEmployee._id,
                    department_id: dept_id,
                    specialization,
                    qualification,
                    experience,
                    room_num,
                    rating: 0,
                    num_ratings: 0
                });
                break;
            case 'nurse':
                const { assigned_dept, location, assigned_room, assigned_bed, assigned_amb } = req.body;
                await Nurse.create({
                    employee_id: savedEmployee._id,
                    assigned_dept,
                    location,
                    assigned_room,
                    assigned_bed,
                    assigned_amb
                });
                break;
            case 'pharmacist':
                await Pharmacist.create({ employee_id: savedEmployee._id });
                break;
            case 'receptionist':
                await Receptionist.create({ employee_id: savedEmployee._id, assigned_dept: dept_id });
                break;
            case 'admin':
                await Admin.create({ employee_id: savedEmployee._id });
                break;
            case 'pathologist':
                const { lab_id } = req.body;
                await Pathologist.create({ employee_id: savedEmployee._id, lab_id });
                break;
            case 'driver':
                await Driver.create({ employee_id: savedEmployee._id });
                break;
            default:
                return res.status(400).json({ message: 'Invalid role specified' });
        }
        
        const payroll = new Payroll({
            employee_id: savedEmployee._id,
            basic_salary: parseInt(basic_salary, 10),
            allowance: parseInt(allowance, 10),
            deduction: parseInt(deduction, 10),
            net_salary: parseInt(basic_salary, 10) + parseInt(allowance, 10) - parseInt(deduction, 10), // Calculate net_salary here
            month_year: new Date(),
            payment_status: "pending",
        });
        // console.log(payroll);
        await payroll.save();
        res.status(201).json({ message: 'Staff added successfully', employee: savedEmployee });
    } catch (error) {
        console.error('Error adding staff:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
async function resetPayrollStatus() {
    try {
        const today = new Date();
        if (today.getDate() > 15) {
            const employees = await Employee.find();
            for (const employee of employees) {
                const payroll = await Payroll.findOne({ employee_id: employee._id });
                if (payroll) {
                    payroll.status = "unpaid";
                    payroll.remaining_payment += payroll.remaining_payment; // Add remaining payment
                    await payroll.save();
                }
            }
            console.log('Payroll status reset and remaining payment added successfully.');
        }
    } catch (error) {
        console.error('Error resetting payroll status:', error);
    }
};
export default resetPayrollStatus;

export const deleteStaff = async (req, res) => {
    try {  
        const { id } = req.params;
        // console.log(id);
        res.status(200).json({ message: 'Staff deleted successfully' });
        // Find the employee by ID
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Delete the employee record
        await Employee.findByIdAndDelete(id);

        // Delete associated role-specific record
        switch (employee.role) {
            case 'doctor':
                await Doctor.findOneAndDelete({ employee_id: id });
                break;
            case 'nurse':
                await Nurse.findOneAndDelete({ employee_id: id });
                break;
            case 'pharmacist':
                await Pharmacist.findOneAndDelete({ employee_id: id });
                break;
            case 'receptionist':
                await Receptionist.findOneAndDelete({ employee_id: id });
                break;
            case 'admin':
                await Admin.findOneAndDelete({ employee_id: id });
                break;
            case 'pathologist':
                await Pathologist.findOneAndDelete({ employee_id: id });
                break;
            case 'driver':
                await Driver.findOneAndDelete({ employee_id: id });
                break;
            default:
                break;
        }

        // Delete associated payroll record
        await Payroll.findOneAndDelete({ employee_id: id });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateSalary = async (req, res) => {
    try {
        const { employee_id,  basic_salary, allowance, deduction, net_salary } = req.body;

        // Find the employee by ID
        const employee = await Employee.findById(employee_id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update the salary
        employee.salary = net_salary;

        // Save the updated employee
        await employee.save();

        // Find the payroll record for the employee
        const payroll = await Payroll.findOne({ employee_id });

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found for the employee' });
        }

        // Update the payroll details
        payroll.basic_salary = basic_salary;
        payroll.allowance = allowance;
        payroll.deduction = deduction;
        payroll.net_salary = net_salary;

        // Save the updated payroll
        await payroll.save();

        res.status(200).json({ message: 'Salary and payroll updated successfully', employee, payroll });
    } catch (error) {
        console.error('Error updating salary and payroll:', error);
        res.status(500).json({ message: 'Failed to update salary and payroll', error });
    }
};



export const processPayroll = async (req, res) => {
    try {
        const { employee_ids } = req.body;
        // console.log('Processing payroll for employee IDs:', employee_ids);
        if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
            return res.status(400).json({ message: 'Invalid employee IDs provided' });
        }
        
        for (const employee_id of employee_ids) {
            // Fetch the payroll details for the employee
            const payroll = await Payroll.findOne({ employee_id });
            if(payroll.payment_status =="paid"){
                continue; 
            }
            else{
                payroll.payment_status = "paid";
                await payroll.save();
            }


            if (!payroll) {
                console.error(`Payroll not found for employee ID: ${employee_id}`);
                continue;
            }

            if (payroll.net_salary <= 0) {
                console.error(`Net salary is zero: ${employee_id}`);
                continue;
            }
            if(payroll.month_year.getMonth() === new Date().getMonth()){
                console.error(`Payroll already processed for this month: ${employee_id}`);
                continue;
            }
            console.log("Here");
            // Generate payslip by calling the generatePayslip function
            await generatePayslipIn({ body: { employee_id } }, {});

            // Update the payroll record
            // payroll.net_salary = 0;
            payroll.payment_status = "paid";
            payroll.generation_date = new Date();
            await payroll.save();

              // Perform transaction: Add amount to employee bank and subtract from hospital bank account
        if (global.hospitalBankAccount.balance < payroll.remaining_payment) {
            throw new Error('Insufficient funds in hospital bank account');
        }

        // Deduct from hospital account
        global.hospitalBankAccount.balance -= payroll.remaining_payment;

        // Add to employee bank account
        const employeeBankAccount = await FinanceLogs.findOne({ account_type: 'employee', employee_id: employee_id });
        await payroll.save();
        if (!employeeBankAccount) {
            const newEmployeeBankAccount = new FinanceLogs({
            account_type: 'employee',
            employee_id: savedEmployee._id,
            balance: payroll.remaining_payment
            });
            await newEmployeeBankAccount.save();
        } else {
            employeeBankAccount.balance += payroll.remaining_payment;
            await employeeBankAccount.save();
        }
        payroll.remaining_payment = 0;
        await payroll.save();
        }
        console.log('Payroll processed successfully for all employees');

        res.status(200).json({ message: 'Payroll processed successfully' });
    } catch (error) {
        console.error('Error processing payroll:', error);
        res.status(500).json({ message: 'Failed to process payroll', error });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { 
            inventoryType,
            itemId,
            order_status  // 'ordered' for accept, 'cancelled' for reject
        } = req.body;

        if (!itemId || !order_status || !inventoryType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let item;
        if (inventoryType === 'medicine') {
            item = await Medicine.findById(itemId);
        } else {
            item = await Equipment.findById(itemId);
        }

        if (!item) {
            return res.status(404).json({ message: `${inventoryType} not found` });
        }

        item.order_status = order_status;
        await item.save();

        res.status(200).json({ 
            message: `Order ${order_status === 'ordered' ? 'accepted' : 'rejected'} successfully`,
            item
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Failed to update order status', error });
    }
};

export const getUniqueDepartments = async (req, res) => {
    try {
        const uniqueDepartments = await Department.aggregate([
            {
                $group: {
                    _id: "$dept_name",
                    id: { $first: "$_id" } // can be random, or change to $last, $min, etc.
                }
            },
            {
                $project: {
                    _id: 0,
                    dept_name: "$_id",
                    id: 1
                }
            }
        ]);

        res.status(200).json({ 
            message: 'Unique departments fetched successfully',
            departments: uniqueDepartments
        });
    } catch (error) {
        console.error('Error fetching unique departments:', error);
        res.status(500).json({ message: 'Failed to fetch unique departments', error });
    }
};
