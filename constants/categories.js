export const DEFAULT_CATEGORIES = [
    // Expense Categories
    { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#FF6B6B', isDefault: true },
    { name: 'Transportation', type: 'expense', icon: '🚗', color: '#4ECDC4', isDefault: true },
    { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#FFE66D', isDefault: true },
    { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#95E1D3', isDefault: true },
    { name: 'Bills & Utilities', type: 'expense', icon: '💡', color: '#F38181', isDefault: true },
    { name: 'Healthcare', type: 'expense', icon: '🏥', color: '#AA96DA', isDefault: true },
    { name: 'Education', type: 'expense', icon: '📚', color: '#FCBAD3', isDefault: true },
    { name: 'Travel', type: 'expense', icon: '✈️', color: '#A8D8EA', isDefault: true },
    { name: 'Other', type: 'expense', icon: '💼', color: '#C7CEEA', isDefault: true },

    // Income Categories
    { name: 'Salary', type: 'income', icon: '💰', color: '#34C759', isDefault: true },
    { name: 'Freelance', type: 'income', icon: '💻', color: '#5AC8FA', isDefault: true },
    { name: 'Investment', type: 'income', icon: '📈', color: '#AF52DE', isDefault: true },
    { name: 'Gift', type: 'income', icon: '🎁', color: '#FF9500', isDefault: true },
    { name: 'Other Income', type: 'income', icon: '💵', color: '#8E8E93', isDefault: true }
];

export const seedDefaultCategories = async (CategoryModel, userId) => {
   try {
       const categoriesToInsert = DEFAULT_CATEGORIES.map(category => ({
           ...category,
              userId: userId || null
       }));
       await CategoryModel.insertMany(categoriesToInsert);
   } catch (error) {
       console.error("Error seeding default categories:", error);
   }
};