import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIAgent extends Document {
  name: string;
  creator: string;
  description: string;
  llmModel: Types.ObjectId;
}

const AIAgentSchema = new Schema<IAIAgent>({
  name: { type: String, required: true },
  creator: { type: String, ref: 'User', required: true },
  description: { type: String, required: true },
  llmModel: { type: Schema.Types.ObjectId, ref: 'AIModel', required: true },
});

export const AIAgentModel = mongoose.model<IAIAgent>('AIAgent', AIAgentSchema);
