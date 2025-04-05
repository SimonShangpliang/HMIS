import Payroll from "../models/payroll.js"

// Find all payrolls for a specific employee
export const findPayrollById = async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ message: "employeeId is required" });
        }

        // Find all payrolls for this employee
        const employeePayrolls = await Payroll.find({ employee_id: employeeId });

        res.status(200).json({ payrolls: employeePayrolls });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};