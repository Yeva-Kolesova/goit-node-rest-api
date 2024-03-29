import express from "express";
import authController from "../controllers/authController.js";
import validateBody from "../decorators/validateBody.js";
import { signupSchema, signinSchema, verifySchema } from "../schemas/usersSchema.js"
import authtenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/signup", validateBody(signupSchema), authController.signup);

authRouter.post("/signin", validateBody(signinSchema), authController.getCurrent);

authRouter.get("/current", authtenticate, authController.getCurrent);

authRouter.post("/signout", authtenticate, authController.signout);

authRouter.get("/verify/:verificationToken", authController.verify);
authRouter.post(
    "/verify",
    validateBody(verifySchema),
    authController.resendVerifyEmail
);

authRouter.patch(
    "/users/avatars",
    upload.single("photo"),
    authtenticate,
    authController.changeAvatar
);
export default authRouter;