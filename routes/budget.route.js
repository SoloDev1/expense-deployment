import express from 'express';
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
} from '../controllers/budget.controller.js';

import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a budget
router.post('/budget', authorize, createBudget);

// Get all budgets for logged-in user
router.get('/budgets', authorize, getBudgets);

// Update a budget
router.put('/budget/:id', authorize, updateBudget);

// Delete a budget
router.delete('/budget/:id', authorize, deleteBudget);

export default router;
