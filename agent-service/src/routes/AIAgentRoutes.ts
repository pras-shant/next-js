import { Router } from 'express';
import { AIAgentController } from '../controllers/AIAgentController';
import { AuthMiddleware } from '../middleware/auth';
import { RoleMiddleware } from '../middleware/roles';

export class AIAgentRoutes {
  public router: Router;
  private controller: AIAgentController;
  private authMiddleware: AuthMiddleware;
  private roleMiddleware: RoleMiddleware;


  constructor() {
    this.router = Router();
    this.controller = new AIAgentController();
    this.authMiddleware = new AuthMiddleware();
    this.roleMiddleware = new RoleMiddleware();

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/',
      this.authMiddleware.authenticateJWT,
      this.roleMiddleware.authorizeRoles('creator'),
      this.controller.createAgent
    );

    this.router.put(
      '/',
      this.authMiddleware.authenticateJWT,
      this.roleMiddleware.authorizeRoles('creator'),
      this.controller.updateAgent
    );

    this.router.delete(
      '/',
      this.authMiddleware.authenticateJWT,
      this.roleMiddleware.authorizeRoles('creator'),
      this.controller.deleteAgent
    );

    this.router.get(
      '/:id',
      this.authMiddleware.authenticateJWT,
      this.controller.getAgentById
    );

    this.router.get(
      '/',
      this.authMiddleware.authenticateJWT,
      this.controller.getAllAgents
    );
  }
}
