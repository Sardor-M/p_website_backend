import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerMethod extends ThrottlerGuard {
  protected errorMessage = 'Too many requests here! ';
}
