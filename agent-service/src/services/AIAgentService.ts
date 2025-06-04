import { AIAgentDAO } from '../dao/AIAgentDAO';

export class AIAgentService {
  private dao = new AIAgentDAO();

  create(data: any) {
    return this.dao.create(data);
  }

  update(id: string, data: any) {
    return this.dao.update(id, data);
  }

  delete(id: string) {
    console.log(id,'iddd')
    return this.dao.delete(id);
  }

  getById(id: string) {
    return this.dao.findById(id);
  }

  getAll() {
    return this.dao.findAll();
  }
}