import Joi from 'joi';

// Embedded Bank Details schema
const BankDetailsJoiSchema = Joi.object({
    bank_name: Joi.string().optional(),
    account_number: Joi.number().integer().optional(),
    ifsc_code: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional()
        .messages({
            'string.pattern.base': 'Invalid IFSC code format'
        }),
    branch_name: Joi.string().optional(),
    balance: Joi.number().min(0).optional()
});

const EmployeeJoiSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    profile_pic: Joi.string().uri().optional().allow(''),
    role: Joi.string()
        .valid("doctor", "nurse", "pharmacist", "receptionist", "admin", "pathologist", "driver")
        .optional(),
    dept_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
        .messages({
            'string.pattern.base': 'dept_id must be a valid ObjectId'
        }),
    phone_number: Joi.string().pattern(/^\d{10}$/).optional()
        .messages({
            'string.pattern.base': 'Phone number must be 10 digits'
        }),
    address: Joi.string().optional(),
    date_of_birth: Joi.date().less('now').optional().messages({
        'date.less': 'Date of birth must be in the past'
    }),
    date_of_joining: Joi.date().optional(),
    gender: Joi.string().valid("Male", "Female").optional(),
    salary: Joi.number().min(0).optional(),
    bank_details: BankDetailsJoiSchema.optional()
});

export {
    BankDetailsJoiSchema,
     EmployeeJoiSchema
}