const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateRegister } = require('../middleware/validation');

// Apply stricter rate limiting to auth routes
router.use(authRateLimiter);

// POST /api/auth/register - Register a new user
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login - User login
router.post('/login', validateLogin, authController.login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - User logout
router.post('/logout', authController.logout);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;