import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as xss from 'xss';

@Injectable()
export class XssProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      this.sanitize(req.body);
    }

    if (req.query) {
      this.sanitize(req.query);
    }

    if (req.params) {
      this.sanitize(req.params);
    }

    next();
  }

  private sanitize(obj: any): void {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = xss.filterXSS(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.sanitize(obj[key]);
        }
      }
    }
  }
}