import "express-session";
import 'express';

declare module "express-session" {
  export interface SessionData {
    tokenSet?: any; 
    returnUrl?: any;
    state?: any;
    nonce?: any;
    user?: any;
  }
}


declare module 'express' {
  export interface Request {
    user?: any;  
  }
}