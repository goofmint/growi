import { body, validationResult } from 'express-validator';

// form rules
export const loginRules = () => {
  return [
    body('loginForm.username')
      .matches(/^[\da-zA-Z\-_.+@]+$/)
      .withMessage('message.Username or E-mail has invalid characters')
      .not()
      .isEmpty()
      .withMessage('message.Username field is required'),
    body('loginForm.password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('message.Password has invalid character')
      .isLength({ min: 6 })
      .withMessage('message.Password minimum character should be more than 6 characters')
      .not()
      .isEmpty()
      .withMessage('message.Password field is required'),
  ];
};

// validation action
export const loginValidation = (req, res, next) => {
  const form = req.body;

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    Object.assign(form, { isValid: true });
    req.form = form;
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  Object.assign(form, {
    isValid: false,
    errors: extractedErrors,
  });
  req.form = form;

  return next();
};
