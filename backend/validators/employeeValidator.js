import Joi from 'joi';

// Embedded Bank Details schema
const BankDetailsJoiSchema = Joi.object({
    bank_name: Joi.string().required(),
    account_number: Joi.number().integer().required(),
    ifsc_code: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required()
        .messages({
            'string.pattern.base': 'Invalid IFSC code format'
        }),
    branch_name: Joi.string().required()
});

// const EmployeeJoiSchema = Joi.object({
//     name: Joi.string().min(3).max(100).required(),
//     email: Joi.string().email().required(),
//     password: Joi.string().min(6).required(),
//     profile_pic: Joi.string().uri().optional().allow(''),
//     role: Joi.string()
//         .valid("doctor", "nurse", "pharmacist", "receptionist", "admin", "pathologist", "driver")
//         .required(),
//     dept_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
//         .messages({
//             'string.pattern.base': 'dept_id must be a valid ObjectId'
//         }),
//     phone_number: Joi.string().pattern(/^\d{10}$/).required()
//         .messages({
//             'string.pattern.base': 'Phone number must be 10 digits'
//         }),
//     address: Joi.string().required(),
//     date_of_birth: Joi.date().required(),
//     date_of_joining: Joi.date().required(),
//     gender: Joi.string().valid("male", "female").required(),
//     salary: Joi.number().min(0).required(),
//     bank_details: BankDetailsJoiSchema.optional()
// });

export {
    BankDetailsJoiSchema,
    // EmployeeJoiSchema
}