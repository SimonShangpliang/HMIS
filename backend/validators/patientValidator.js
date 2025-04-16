import Joi from 'joi';

// Sub-schema: Vitals
const VitalsJoiSchema = Joi.object({
    date: Joi.date().required(),
    time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.pattern.base': 'Time must be in HH:mm 24-hour format',
        }),
    bloodPressure: Joi.string()
        .pattern(/^\d{2,3}\/\d{2,3}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Blood pressure must be in format "120/80"',
        }),
    bodyTemp: Joi.number().optional(),
    pulseRate: Joi.number().optional(),
    breathingRate: Joi.number().optional()
});

// Sub-schema: Patient Info
const PatientInfoJoiSchema = Joi.object({
    age: Joi.number().integer().min(0).optional(),
    height: Joi.number().min(0).optional(),
    weight: Joi.number().min(0).optional(),
    bloodGrp: Joi.string()
        .valid("A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-")
        .optional(),
    familyHistory: Joi.string().allow(''),
    bedNo: Joi.number().integer().min(1).optional(),
    roomNo: Joi.number().integer().min(1).optional(),
    other: Joi.string().allow('')
});

// Main Patient schema
const PatientJoiSchema = Joi.object({
    password: Joi.string().min(6).optional(),
    name: Joi.string().min(3).max(100).optional(),
    profile_pic: Joi.string().uri().optional().allow(''),
    phone_number: Joi.string().pattern(/^\d{10}$/).optional(),
    emergency_contact: Joi.string().pattern(/^\d{10}$/).optional(),
    email: Joi.string().email().optional(),
    date_of_birth: Joi.date().less('now').optional().messages({
        'date.less': 'Date of birth must be in the past'
    }),
    aadhar_number: Joi.string().pattern(/^\d{12}$/).optional(),
    gender: Joi.string().valid("Male", "Female").optional(),
    address: Joi.string().optional(),
    patient_info: PatientInfoJoiSchema.optional(),
    vitals: Joi.array().items(VitalsJoiSchema).optional(),
    insurance_details: Joi.array()
        .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
        .optional()
});


export {
    PatientJoiSchema,
    VitalsJoiSchema,
    PatientInfoJoiSchema
}