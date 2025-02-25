// src/middleware/csrf.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // buyerda skip qilamiz qaysiki statelarni mutate qilmasa
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // csrf protection 
    const csrfToken = req.csrfToken();
    
    // we add  CSRF token to response headers for frontend 
    // to use it
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    next();
  }
}