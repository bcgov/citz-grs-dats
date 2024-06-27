// authController.ts
import { Request, Response } from 'express';
import { setupKeycloak } from '../auth/keycloak-config';


export const login = async (req: Request, res: Response) => {
    const client = await setupKeycloak();
    const authorizationUrl = client.authorizationUrl({
        scope: 'openid profile email',
    });
    res.redirect(authorizationUrl);
};

export const logout = async (req: Request, res: Response) => {
    const client = await setupKeycloak();
    const endSessionUrl = client.endSessionUrl({
        //id_token_hint: req.query.id_token_hint
    });
    res.redirect(endSessionUrl);
};
