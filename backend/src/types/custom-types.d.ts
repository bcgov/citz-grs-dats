import "express-session";

declare module "express-session" {
  export interface SessionData {
    tokenSet?: any; // Define it as any or a more specific type if you have the structure of the token set
  }
}