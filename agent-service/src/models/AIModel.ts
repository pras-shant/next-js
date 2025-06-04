import mongoose, { Document, Schema } from 'mongoose';

export interface IAIModel extends Document {
  llmModel: string;
}

const AIModelSchema = new Schema<IAIModel>({
  llmModel: { type: String, required: true }
});

export const AIModel = mongoose.model<IAIModel>('AIModel', AIModelSchema);
