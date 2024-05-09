import "express-session";
import 'express';

declare module "express-session" {
  export interface SessionData {
    tokenSet?: any; // Define it as any or a more specific type if you have the structure of the token set
  }
}


declare module 'express' {
  export interface Request {
    user?: any;  // Define `user` as any, or use a more specific type if you know the structure
  }
}