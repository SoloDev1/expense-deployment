import Settings from "../models/settings.model.js";

export const getUserSettings = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const settings = await Settings
            .findOne({ userId })
            .lean();
        if (!settings) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }
        res.status(200).json({ success: true, message: 'Settings retrieved successfully', data: settings });
    } catch (error) {
        next(error);
    }
}; 

export const updateUserSettings = async (req, res, next) => {
    const { userId, currency, darkMode, notifications, dateFormat, language  } = req.params;
    const updateData = {};
        if (currency) updateData.currency = currency;
        if (darkMode !== undefined) updateData.darkMode = darkMode;
        if (notifications) updateData.notifications = notifications;
        if (dateFormat) updateData.dateFormat = dateFormat;
        if (language) updateData.language = language;

    try {
        const updatedSettings = await Settings.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();
        if (!updatedSettings) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }
        res.status(200).json({ success: true, message: 'Settings updated successfully', data: updatedSettings });
    } catch (error) {
        next(error);
    }   
};