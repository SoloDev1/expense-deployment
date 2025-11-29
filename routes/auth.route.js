import express from 'express';
import { Router } from 'express';
import { signUp, signIn, googleSignIn, appleSignIn, signOut } from '../controllers/auth.controller.js';
import { authorize } from '../middleware/auth.middleware.js';



const authRoute = express.Router();

authRoute.post("/signup", signUp);
authRoute.post("/signin", signIn);
authRoute.post("/google", googleSignIn);
authRoute.post("/apple", appleSignIn);
authRoute.post("/signout", authorize, signOut);

export default authRoute;
