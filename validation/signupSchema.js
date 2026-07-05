const Joi = require("joi");

module.exports = Joi.object({
  username: Joi.string().alphanum().max(20).required(),

  email: Joi.string().email().required(),

  password: Joi.string().max(20).required(),
});
