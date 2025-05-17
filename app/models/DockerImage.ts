import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDockerImage extends Document {
  user_address: string;
  image_name: string;
  s3_url: string;
  uploaded_at: Date;
  validated: boolean;
}

const DockerImageSchema = new Schema<IDockerImage>({
  user_address: { type: String, required: false },
  image_name: { type: String, required: false },
  s3_url: { type: String, required: false },
  uploaded_at: { type: Date, default: Date.now },
  validated: { type: Boolean, default: false },
});

// Export the model with the appropriate TypeScript type
const DockerImage: Model<IDockerImage> =
  mongoose.models.DockerImage || mongoose.model<IDockerImage>('DockerImage', DockerImageSchema);

export default DockerImage;
