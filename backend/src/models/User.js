import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["candidate", "hr"], default: "candidate" },
  isAuthenticated:{type:Boolean ,default:false},
  emailIsAuthenticated:{type:Boolean ,default:false}

}, { timestamps: true });

export default mongoose.model("User", userSchema);
