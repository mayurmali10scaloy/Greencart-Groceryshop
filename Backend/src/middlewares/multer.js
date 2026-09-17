const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUpload = (folder) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) { 
            cb(null, `uploads/${folder}`);
        },

        filename: function (req, file, cb) {
            const uniqueName =
                `${Date.now()}_${file.originalname}`;

            cb(null, uniqueName);
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });
};

const deleteImage = (folder, fileName) => {
    if (!fileName) return;

    const imagePath = path.join(__dirname, "..", "..", "uploads", folder, fileName);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

module.exports = {
    userUpload: createUpload("users"),
    productUpload: createUpload("products"),
    deleteImage
};