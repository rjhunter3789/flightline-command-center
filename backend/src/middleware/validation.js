const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Deal validation schemas
const dealSchema = Joi.object({
  customer: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email(),
    phone: Joi.string().required()
  }).required(),
  vehicle: Joi.object({
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    vin: Joi.string(),
    stockNumber: Joi.string(),
    price: Joi.number().positive()
  }).required(),
  stage: Joi.string().valid('showroom', 'test_drive', 'negotiation', 'finance', 'delivery', 'completed'),
  salesRep: Joi.string(),
  tradeIn: Joi.object({
    make: Joi.string(),
    model: Joi.string(),
    year: Joi.number(),
    value: Joi.number()
  })
});

const dealUpdateSchema = Joi.object({
  customer: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string()
  }),
  vehicle: Joi.object({
    make: Joi.string(),
    model: Joi.string(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
    vin: Joi.string(),
    stockNumber: Joi.string(),
    price: Joi.number().positive()
  }),
  stage: Joi.string().valid('showroom', 'test_drive', 'negotiation', 'finance', 'delivery', 'completed'),
  notes: Joi.string(),
  urgency: Joi.string().valid('normal', 'medium', 'high', 'critical')
}).min(1);

// Auth validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'manager', 'sales', 'finance'),
  dealershipId: Joi.string()
});

module.exports = {
  validateDeal: validate(dealSchema),
  validateDealUpdate: validate(dealUpdateSchema),
  validateLogin: validate(loginSchema),
  validateRegister: validate(registerSchema),
  validate
};