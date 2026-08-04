declare global {
  namespace Express {
    interface Request {
      /** Set by the auth middleware for authenticated requests. */
      userId?: number;
    }
  }
}

export {};
