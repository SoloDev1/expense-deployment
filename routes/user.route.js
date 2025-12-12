import Router from 'express';
import { authorize } from '../middleware/auth.middleware.js';

import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount
} from '../controllers/user.controller.js';

const userRouter = Router();

// ✅ Normal authenticated users
userRouter.get('/profile', authorize, getUserProfile);
userRouter.put('/profile', authorize, updateUserProfile);
userRouter.delete('/profile', authorize, deleteUserAccount);

export default userRouter;
