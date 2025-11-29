import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/user.model.js';


export const authorize = async (req, res, next) =>{
    try {
        let token;
        const authHeader = req.headers.authorization;
        if(authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if(!token) return res.status(401).json({message: 'Unauthorized'})

        const decode = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decode.userId).select('-password');

        if(!user) return res.status(401).json({message: 'User no longer exists'})

        req.user = user;
        next();


    } catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({message: 'Session expired. Please log in again.'})
        }

        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({message: 'Invalid token. Please log in again.'})
        }
        res.status(401).json({message: 'Unauthorized', error: error.message})
    }


}