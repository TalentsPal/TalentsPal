import { IJWTPayload } from './utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

export { };
