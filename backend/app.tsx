import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy } from "openid-client";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import * as routers from "./src/api/routes";
import { swaggerJSDoc } from "swagger-jsdoc";
import { swaggerUi } from "swagger-ui-express";
import { swaggerDefinition } from "./swagger-definition";
import { datsComponents } from "./swagger-components";
import { initializeKeycloakClient } from "./src/config/authConfig";

const store = new session.MemoryStore();

dotenv.config(); // Load environment variables from .env
// Connect to MongoDB
const mongoUrl =
  process.env.MONGO_URI || "mongodb://dbuser:dbpass@mongodb:27017/dats";
const port = process.env.SERVER_PORT || 5000;
// (<any>mongoose).Promise = bluebird;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("  MongoDB is connected successfully.");
  })
  .catch((err: any) => {
    console.error(
      "  MongoDB connection error. Please make sure MongoDB is running. " + err
    );
    process.exit();
  });
// Express configuration

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  // Include your components in the definition
  components: datsComponents,
  // components: {
  //   schemas: components, // Use the components from the separate file
  // },
  apis: ["src/api/controller/*-controller.ts"],
};
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = swaggerJSDoc(options);

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set("server_port", port);

app.use(cors());

// Use CORS middleware with custom options
// app.use(cors({
//     origin: 'http://localhost:3000', // Replace with your client's origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   }));

// app.use(cors({
//     origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void  => {
//         // allow requests with no origin
//         if (requestOrigin && CORS_WHITELIST.indexOf(requestOrigin) === -1) {
//             const message: string = "The CORS policy for this origin doesn't allow access from the particular origin.";
//             return callback(new Error(message), false);
//         } else {
//             // tslint:disable-next-line:no-null-keyword
//             return callback(null, true);
//         }
//     },
//     credentials: true
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SSO_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store,
  })
);

//Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

let tokenset = {};

// initializeKeycloakClient()
//   .then((keycloakClient) => {
//     console.log("Keycloak client ID:", keycloakClient.keycloakClient.client_id);

//     passport.use(
//       "oidc",
//       new Strategy(
//         { client: keycloakClient.keycloakClient },
//         (tokenSet, userinfo, done) => {
//           tokenset = tokenSet;
//           console.log(tokenSet.claims());
//           // return done(null, tokenSet.claims());
//           // Generate JWT token
//           const token = jwt.sign(
//             userinfo,
//             process.env.JWT_SECRET || "jwtsecret",
//             { expiresIn: "1h" }
//           );

//           // Pass the token to the callback function
//           return done(null, token);
//         }
//       )
//     );
//   })
//   .catch((error) => {
//     console.error("Error initializeKeycloakClient:", error);
//   });

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send("hello world from HR management App Backend");
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

interface AuthenticatedRequest extends Request {
  user?: string; // Assuming 'user' is a string, replace it with the correct type if needed
}

// Authentification Routes are here but we will need to refactor them in Layers
const checkAuthenticated = (req, res, next) => {
  if (req?.session?.passport?.user) {
    return next();
  }
  res.redirect("/auth");
};

// app.get("/auth/callback", (req, res, next) => {
//   passport.authenticate("oidc", {
//     successRedirect: "/api/transfers",
//     failureRedirect: "/",
//   })(req, res, next);
// });

app.get("/", (req, res, next) => {
  res.render("index", {});
});

// app.get("/auth", (req, res, next) => {
//   passport.authenticate("oidc")(req, res, next);
// });

//app.get("/auth", passport.authenticate("oidc"));
app.get(
  "/auth",
  function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, X-Auth-Token, Authorization, Accept,charset,boundary,Content-Length"
    );
    next();
  },
  passport.authenticate("oidc")
);
app.get(
  "/auth/callback",
  passport.authenticate("oidc", { session: false }),
  (req: AuthenticatedRequest, res: Response) => {
    // Ensure req.user exists before accessing it
    if (req.user) {
      // Send the JWT token back to the frontend

      res.json({ token: req.user });
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  }
);

// app.get('/home', checkAuthenticated, (req, res, next) => {
//   res.render('home', {
//     username: `${req.session.passport.user.given_name} ${req.session.passport.user.family_name}`,
//   });
// });

// app.get('/logout', (req, res, next) => {
//   req.session.destroy();
//   const retUrl = `${process.env.SSO_AUTH_SERVER_URL}/realms/${
//     process.env.SSO_REALM
//   }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
//     process.env.SSO_LOGOUT_REDIRECT_URI,
//   )}&id_token_hint=${tokenset.id_token}`;
//   res.redirect(`https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(retUrl)}`);
// });

// End

//app.use("/api", checkAuthenticated, routers.transferRouter);
app.use("/api", routers.transferRouter);
app.use("/api", routers.digitalFileListRoute);
app.use("/api", routers.digitalFileRouter);
app.use("/api", routers.uploadFilesRouter);

app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(
    `[${req.method} ${req.originalUrl}] is called, body is ${JSON.stringify(
      req.body
    )}`
  );
  next();
});

export default app;
