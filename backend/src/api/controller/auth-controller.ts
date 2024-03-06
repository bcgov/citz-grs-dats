import { Request, Response, NextFunction } from "express";

export default class AuthController {
  static getAuth(getAuth: any) {
    throw new Error("Method not implemented.");
  }
  static getTransfers(getTransfers: any) {
    throw new Error("Method not implemented.");
  }

  //   async getAuth(req: Request, res: Response, next: NextFunction) {
  //     try {
  //       passport.authenticate("oidc")(req, res, next);
  //     } catch (error) {
  //       res.status(500).json({ error: "An error occurred" });
  //     }
  //   }

  //   async getAuthCallback(req: Request, res: Response, next: NextFunction) {
  //     passport.authenticate("oidc", {
  //       successRedirect: "/",
  //       failureRedirect: "/auth",
  //     })(req, res, next);
  //   }
}
