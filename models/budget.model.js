import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    limit: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    month: { type: String, required: true }, // format: YYYY-MM
    spent: { type: Number, default: 0 },
    alertThreshold: { type: Number, default: 80 }, // %
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1 });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;