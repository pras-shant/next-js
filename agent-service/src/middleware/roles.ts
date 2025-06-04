import { AuthRequest } from './auth';
import { Response, NextFunction } from 'express';

export class RoleMiddleware {
  public authorizeRoles(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user || !roles.includes(req.user.role)) {
        console.log(req.user,'reqqq')
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      next();
    };
  }
}
