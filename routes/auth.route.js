import { Router } from 'express';
import {
    signUp,
    signIn,
    googleSignIn,
    appleSignIn,
    signOut
} from '../controllers/auth.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const authRoute = Router();

// Public Routes
authRoute.post("/signup", signUp);
authRoute.post("/signin", signIn);
authRoute.post("/google", googleSignIn);
authRoute.post("/apple", appleSignIn);

// Protected Routes
authRoute.post("/signout", authorize, signOut);

export default authRoute;