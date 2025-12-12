import Router from 'express';
import { authorize } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
} from '../controllers/admin.controller.js';

const adminRouter = Router();

// ✅ Admin-only routes
adminRouter.get('/users', authorize, requireAdmin, getAllUsers);
adminRouter.get('/users/:id', authorize, requireAdmin, getUserById);
adminRouter.put('/users/:id', authorize, requireAdmin, updateUserById);
adminRouter.delete('/users/:id', authorize, requireAdmin, deleteUserById);

export default adminRouter;
