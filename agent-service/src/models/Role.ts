import mongoose, { Schema } from "mongoose";

export interface IRole extends Document {
    name: 'creator' | 'user';
  }
  
  const RoleSchema = new Schema<IRole>({
    name: { type: String, enum: ['creator', 'user'], required: true, unique: true }
  });
  
  export const Role = mongoose.model<IRole>('Role', RoleSchema);