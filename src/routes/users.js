const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
];

// Routes
router.get('/', authenticate, requireAdmin, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUserValidation, validate, updateUser);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

module.exports = router;
