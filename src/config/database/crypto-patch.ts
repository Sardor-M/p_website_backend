import * as crypto from 'crypto';

(global as any).crypto = {
  randomUUID: () => crypto.randomUUID()
};