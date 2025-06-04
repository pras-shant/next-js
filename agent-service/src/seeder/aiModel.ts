import mongoose from 'mongoose';
import { AIModel, IAIModel } from '../models/AIModel'; // 🔁 Update this path

const MONGO_URI = 'mongodb://localhost:27017'; // 🔁 Replace with your DB URI

const seedAIModels = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const models: IAIModel['llmModel'][] = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'claude-3-opus',
      'claude-3-sonnet',
      'mistral-7b',
      'llama-3',
    ];

    for (const model of models) {
      const exists = await AIModel.findOne({ llmModel: model });
      if (!exists) {
        await AIModel.create({ llmModel: model });
        console.log(`✅ AI model '${model}' created.`);
      } else {
        console.log(`ℹ️  AI model '${model}' already exists.`);
      }
    }

    console.log('🎉 AI model seeding completed.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding AI models:', error);
    process.exit(1);
  }
};

seedAIModels();
