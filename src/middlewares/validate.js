const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));

  // Parse JSON strings in multipart form requests
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Handle JSON strings sent in formData for complex objects
    for (const key in object.body) {
      if (typeof object.body[key] === 'string' &&
        (key === 'boost' || object.body[key].startsWith('{'))) {
        try {
          object.body[key] = JSON.parse(object.body[key]);
        } catch (e) {
          // If parsing fails, keep it as string
          console.log(`Failed to parse JSON for field ${key}:`, e);
        }
      }
    }
  }

  // Special handling for PATCH requests with empty bodies
  if (req.method === 'PATCH' && validSchema.body &&
    (!object.body || Object.keys(object.body).length === 0)) {
    // For PATCH requests, we'll skip body validation if body is empty
    // This allows empty PATCH requests which might be used to trigger side effects
    console.log('Empty body detected in PATCH request, skipping body validation');
    delete validSchema.body;
  }

  if (Object.keys(validSchema).length === 0) {
    return next();
  }

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
