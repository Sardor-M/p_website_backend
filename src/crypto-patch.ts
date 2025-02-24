import * as crypto from 'crypto';

if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {
    randomUUID: () => crypto.randomUUID()
  };
}