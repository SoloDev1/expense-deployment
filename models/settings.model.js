import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CNY', 'AUD', 'CAD', 'CHF', 'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR'],
        default: 'USD'
    },
    darkMode: {
        type: Boolean,
        default: false
    },
    notifications: {
        budgetAlerts: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: false },
        monthlyReports: { type: Boolean, default: true }
    },
    dateFormat: {
        type: String,
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
        default: 'MM/DD/YYYY'
    },
    language: {
        type: String,
        enum: ['en', 'es', 'fr', 'de', 'pt'],
        default: 'en'
    }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
