// upload.js
import multer from "multer";
import path from "path";
import HttpError from "../helpers/HttpError.js";

const destination = path.resolve("tmp");

const storage = multer.diskStorage({
    destination,
    filename: function (req, file, callback) {
        const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${uniquePrefix}-${file.originalname}`;
        callback(null, filename);
    },
});

const limits = {
    fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, callback) => {
    const extenstion = file.originalname.split(".").pop();
    if (extenstion === "exe") {
        callback(HttpError(400, ".exe extenstion not allow"));
    }
    callback(null, true);
};

const upload = multer({
    storage,
    limits,
    fileFilter,
    dest: "tmp",
});

export default upload;
