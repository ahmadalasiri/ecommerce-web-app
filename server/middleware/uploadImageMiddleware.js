const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
    const multerSorage = multer.memoryStorage();
    const multerFileFilter = (req, file, cd) => {
        if (file.mimetype.startsWith("image")) {
            cd(null, true);
        } else {
            cd(new ApiError(`Only Images allowed`, 400), false);
        }
    };
    const upload = multer({
        storage: multerSorage,
        fileFilter: multerFileFilter,
    });

    return upload;
};

exports.uploadSingleFile = (fileName) => multerOptions().single(fileName);

exports.uploadMixOfFiles = (arrayOfFields) =>
    multerOptions().fields(arrayOfFields);
