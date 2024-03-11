import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Jimp from "jimp";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";


import gravatar from "gravatar";
import "dotenv/config";

const avatarsDir = path.resolve("public", "avatars");


import * as authServices from "../services/authServices.js";
import * as userServices from "../services/userServices.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

import HttpError from "../helpers/HttpError.js";

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userServices.findUser({ email });
        if (user) {
            throw HttpError(409, "Email already in use");
        }

        const verificationToken = nanoid();
        const avatarURL = gravatar.url(email);
        const newUser = await authServices.signup({
            ...req.body,
            avatarURL,
            verificationToken,
        });

        const verifyEmail = {
            to: email,
            subject: "Verify email",
            html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">CLick to verify email</a>`,
        };

        await sendEmail(verifyEmail);

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

        if (!user.verify) {
            throw HttpError(401, "Email not verify");
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

const changeAvatar = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { path: oldPath, filename } = req.file;

        Jimp.read(oldPath, (err, lenna) => {
            if (err) throw err;
            lenna.resize(250, 250).write(`${avatarsDir}\\${filename}`);
            fs.rm(oldPath);
        });
        const avatarURL = path.join("avatars", filename);

        await authServices.setAvatar(_id, avatarURL);
        return res.json({ avatarURL });
    } catch (error) {
        next(error);
    }
};

export const verify = async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await findUser({ verificationToken });

        if (!user) {
            throw HttpError(404, "User not found");
        }
        await authServices.updateByFilter(
            { _id: user._id },
            { verify: true, verificationToken: null }
        );

        res.json({
            message: "Verification successful",
        });
    } catch (error) {
        next(error);
    }
};

export const resendVerifyEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw HttpError(400, "missing required field email");
        }
        const user = await findUser({ email });
        if (!user) {
            throw HttpError(404, "User not found");
        }
        if (user.verify) {
            throw HttpError(400, "Verification has already been passed");
        }

        const verifyEmail = {
            to: email,
            subject: "Verify email",
            html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">CLick to verify email</a>`,
        };

        await sendEmail(verifyEmail);

        res.json({
            message: "Verification email sent",
        });
    } catch (error) {
        next(error);
    }
};

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),

    changeAvatar: ctrlWrapper(changeAvatar),
    verify,
    resendVerifyEmail,
}