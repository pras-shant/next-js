import mongoose, { Document, Model, Schema } from 'mongoose';

// Extend IUser interface to include nonce data
export interface IUser extends Document {
  user_address: string;
  username: string;
  email: string;
  created_at: Date;
  is_active: boolean;
  nonce: string; // Add nonce field
}

// Update UserSchema to include nonce field
const UserSchema = new Schema<IUser>({
  user_address: { type: String, required: false },
  username: { type: String, required: false },
  email: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: false },
  nonce: { type: String, required: false }, // New field
});

// Export the model with the appropriate TypeScript type
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;