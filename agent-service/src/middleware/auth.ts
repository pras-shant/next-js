import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export class AuthMiddleware {
  public authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token missing' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.decode(token);
console.log(payload,'payloaddddddd')
console.log(token,'tokennnn')
    try {
      const decoded = jwt.verify(token, 'your-secret-key') as any;
      console.log(decoded,'decodedd')
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: 'Invalid token' });
    }
  };
}
