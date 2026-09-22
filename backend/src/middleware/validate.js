const ApiError = require('../utils/ApiError');
const Task = require('../models/Task');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || !name.trim()) errors.push('Name is required');
  if (!email || !EMAIL_REGEX.test(email)) errors.push('A valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters long');

  if (errors.length) {
    throw new ApiError(400, errors.join(', '));
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email)) errors.push('A valid email is required');
  if (!password) errors.push('Password is required');

  if (errors.length) {
    throw new ApiError(400, errors.join(', '));
  }
  next();
};

const validateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;
  const errors = [];

  // Title is required on create, optional (but non-empty if provided) on update
  if (req.method === 'POST' && (!title || !title.trim())) {
    errors.push('Title is required');
  }
  if (title !== undefined && !title.trim()) {
    errors.push('Title cannot be empty');
  }

  if (status !== undefined && !Task.STATUS_VALUES.includes(status)) {
    errors.push(`Status must be one of: ${Task.STATUS_VALUES.join(', ')}`);
  }

  if (priority !== undefined && !Task.PRIORITY_VALUES.includes(priority)) {
    errors.push(`Priority must be one of: ${Task.PRIORITY_VALUES.join(', ')}`);
  }

  if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
    errors.push('Due date must be a valid date');
  }

  if (errors.length) {
    throw new ApiError(400, errors.join(', '));
  }
  next();
};

module.exports = { validateSignup, validateLogin, validateTask };
