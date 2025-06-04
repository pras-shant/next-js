import { Request, Response, NextFunction } from 'express';
import { AIAgentService } from '../services/AIAgentService';

const service = new AIAgentService();

export class AIAgentController {
  async createAgent(req: any, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, creator: req.user.user_address };
      console.log(data,'dataa')
      const agent = await service.create(data);
      res.status(201).json(agent);
    } catch (error) {
      next(error);
    }
  }

  async updateAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await service.update(req.query.id, req.body);
      if (!agent) throw Object.assign(new Error('Agent not found'), { status: 404 });
      res.json(agent);
    } catch (error) {
      next(error);
    }
  }

  async deleteAgent(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('hiiii')
      console.log(req.query.id,'idddd')
      const id = req.query.id
      const agent = await service.delete(id);
      console.log(agent,'agent')
      if (!agent) throw Object.assign(new Error('Agent not found'), { status: 404 });
      res.json({ message: 'Agent deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getAgentById(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await service.getById(req.params.id);
      if (!agent) throw Object.assign(new Error('Agent not found'), { status: 404 });
      res.json(agent);
    } catch (error) {
      next(error);
    }
  }

  async getAllAgents(_req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await service.getAll();
      res.json(agents);
    } catch (error) {
      next(error);
    }
  }
}