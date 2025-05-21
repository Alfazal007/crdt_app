import { Router } from "express";
import { signupHandler } from "./controller/auth.signup";
import { signInHandler } from "./controller/auth.signin";

const authRouter = Router()

authRouter.route("/signup").post(signupHandler)
authRouter.route("/signin").post(signInHandler)

export {
    authRouter
}
