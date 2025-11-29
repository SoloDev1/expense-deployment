import Router from 'express';

import {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount
} from '../controllers/user.controller.js';
import { authorize } from '../middleware/auth.middleware.js';


const userRouter = Router();

userRouter.get('/profile', authorize, getUserProfile);
userRouter.put('/profile', authorize, updateUserProfile);
userRouter.delete('/profile', authorize, deleteUserAccount);
export default userRouter;