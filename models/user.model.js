import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Name is required' ],
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: [ true, 'Email is required' ],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (email) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Invalid email address'
        }
    },
    password: {
        type: String,
        required: [ true, 'Password is required' ],
        minlength: 8,
        maxlength: 100, 
    },

    googleId: {
        type: String,
        default: null
    },

    appleId: {
        type: String,
        default: null
    },
    currency:   {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CNY', 'AUD', 'CAD', 'CHF', 'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR', 'PLN', 'DKK', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR', 'MYR', 'THB', 'IDR', 'NGN'],
        default: 'USD'
    },
    darkMode: {
        type: Boolean,
        default: false
    },
    
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;