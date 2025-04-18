import Joi from 'joi';

export const ReportJoiSchema = Joi.object({
    status: Joi.string()
        .valid("pending", "completed")
        .required(),

    reportText: Joi.string().allow('').optional(),

    title: Joi.string()
        .min(3)
        .required(),
    description: Joi.string().allow('').optional(),

    createdBy: Joi.string()
        .required()
        .messages({
            'string.pattern.base': 'createdBy must be a valid ObjectId'
        }),
}).unknown(true);
