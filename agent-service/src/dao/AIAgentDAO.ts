import {  AIAgentModel, IAIAgent } from '../models/AIAgent';

export class AIAgentDAO {
  async create(data: Partial<IAIAgent>) {
    return await AIAgentModel.create(data);
  }

  async findAll() {
    return await AIAgentModel.find();
  }

  async findById(id: string) {
    return await AIAgentModel.findById(id).populate('creator model');
  }

  async update(id: string, data: Partial<IAIAgent>) {
    return await AIAgentModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await AIAgentModel.findByIdAndDelete(id);
  }
}

