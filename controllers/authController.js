import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as authServices from "../services/authServices.js";
import * as userServices from "../services/userServices.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

import HttpError from "../helpers/HttpError.js";

const { JWT_SECRET } = process.env;

const signup = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userServices.findUser({ email });
        if (user) {
            throw HttpError(409, "Email already in use");
        }

        const newUser = await authServices.signup(req.body);

        res.status(201).json({
            email: newUser.email,
            subscription: newUser.subscription,
        });
    } catch (error) {
        next(error);
    }
};

const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await userServices.findUser({ email });
        if (!user) {
            throw HttpError(401, "Email or password invalid");
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            throw HttpError(401, "Email or password invalid");
        }

        const payload = {
            id: user._id,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
        await authServices.setToken(user._id, token);

        res.json({
            token,
            user: { email: user.email, subscription: user.subscription },
        });
    } catch (error) {
        next(error);
    }
};

const getCurrent = async (req, res, next) => {
    const { email, subscription } = req.user;

    res.json({
        email,
        subscription,
    });
};

const signout = async (req, res, next) => {
    const { _id } = req.user;
    await authServices.setToken(_id);

    res.json({
        message: "Signout success",
    });
};

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
}