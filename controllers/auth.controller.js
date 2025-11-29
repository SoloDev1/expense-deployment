import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Built-in node module for random passwords
import User from '../models/user.model.js';
import Category from "../models/category.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID, APPLE_BUNDLE_ID } from '../config/env.js';
import { OAuth2Client } from "google-auth-library";
import appleSignin from 'apple-signin-auth'; 

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- HELPER: Generate Token ---
const generateToken = (id) => {
    return jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// --- HELPER: Create Default Categories ---
// We extract this so we can reuse it for Email, Google, and Apple signups
const createDefaultCategories = async (userId, session) => {
    const defaultCategories = [
        { name: 'Salary', type: 'income', userId },
        { name: 'Freelance', type: 'income', userId },
        { name: 'Food', type: 'expense', userId },
        { name: 'Rent', type: 'expense', userId },
        { name: 'Utilities', type: 'expense', userId },
        { name: 'Entertainment', type: 'expense', userId },
    ];
    await Category.insertMany(defaultCategories, { session });
};

// STANDARD SIGN UP

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const [newUser] = await User.create([{
            name,
            email,
            password: hashedPassword
        }], { session });

        // Create Categories
        await createDefaultCategories(newUser._id, session);

        const token = generateToken(newUser._id);

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { token, user: newUser }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}


// STANDARD SIGN IN

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user exists but only has social login (no password)
        if (!user.password) {
             const error = new Error('Please login with Google/Apple');
             error.statusCode = 400;
             throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: { token, user }
        });
    } catch (error) {
        next(error);
    }
}


// GOOGLE SIGN IN

export const googleSignIn = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        const { tokenId } = req.body; // This is the idToken from frontend

        // Verify Token
        const ticket = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: GOOGLE_CLIENT_ID,
        });
        
        const { sub: googleId, email, name, picture } = ticket.getPayload();
        
        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Existing user: Link Google ID if not present
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // New User: Needs Transaction to create User + Categories
            session.startTransaction();
            
            // Generate a random password to satisfy Schema if password is required
            const randomPassword = crypto.randomBytes(16).toString('hex'); 
            
            const [newUser] = await User.create([{
                name,
                email,
                googleId,
                password: randomPassword, // Or leave empty if Schema allows
                // avatar: picture // Add this if your schema has an avatar field
            }], { session });

            await createDefaultCategories(newUser._id, session);
            
            await session.commitTransaction();
            user = newUser;
        }

        const token = generateToken(user._id);
        
        res.status(200).json({
            success: true,
            message: 'Google login successful',
            data: { token, user }
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
};

// APPLE SIGN IN

export const appleSignIn = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        const { identityToken, fullName } = req.body; // fullName is { givenName, familyName }

        // Verify Token using apple-signin-auth
        const appleIdTokenClaims = await appleSignin.verifyIdToken(identityToken, {
            audience: APPLE_BUNDLE_ID, 
            ignoreExpiration: true, // Optional, depending on your strictness
        });

        const { sub: appleId, email } = appleIdTokenClaims;

        // Check for user by Apple ID *OR* Email
        let user = await User.findOne({ 
            $or: [{ appleId }, { email }] 
        });

        if (user) {
            // Link Apple ID if missing
            if (!user.appleId) {
                user.appleId = appleId;
                await user.save();
            }
        } else {
            // New User: Needs Transaction
            if (!email) {
                // Apple only sends email on FIRST login. If we don't have it and user not found, we can't create account.
                throw new Error("Apple did not provide an email. Please go to Apple ID settings and revoke access for this app, then try again.");
            }

            session.startTransaction();

            // Construct name from frontend data (Apple only sends name on first login)
            const constructedName = fullName 
                ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() 
                : "Apple User";
            
            const randomPassword = crypto.randomBytes(16).toString('hex');

            const [newUser] = await User.create([{
                name: constructedName || "User",
                email,
                appleId,
                password: randomPassword
            }], { session });

            await createDefaultCategories(newUser._id, session);

            await session.commitTransaction();
            user = newUser;
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Apple login successful',
            data: { token, user }
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
};

export const signOut = (req, res) => {
    // Client side just needs to delete the token
    res.status(200).json({
        success: true,
        message: 'User signed out successfully'
    });
}