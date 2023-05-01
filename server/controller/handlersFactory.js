const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findByIdAndDelete(id);

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }

        // Trigger "remove" event when update document to get review details
        // Model.remove();
        res.status(204).send();
    });

exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        if (!document) {
            return next(
                new ApiError(`No document for this id ${req.params.id}`, 404)
            );
        }
        // Trigger "save" event when update document to get reviews
        Model.save();
        res.status(200).json({ data: document });
    });

exports.createOne = (Modle) =>
    asyncHandler(async (req, res) => {
        const document = await Modle.create(req.body);
        res.status(201).json({ data: document });
    });

exports.getOne = (Model, populateOpt) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        let query = Model.findById(id);
        if (populateOpt) {
            query = query.populate(populateOpt);
        }
        const document = await query;
        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }
        res.status(200).json({ data: document });
    });

exports.getAll = (Model, modelName = "") =>
    asyncHandler(async (req, res) => {
        // Build query
        const countDocments = await Model.countDocuments();
        const apiFeatures = new ApiFeatures(
            Model.find(req.filterObject),
            req.query
        )
            .paginate(countDocments)
            .sort()
            .filter()
            .limitFields()
            .search(modelName);

        // Execute query
        const { mongooseQuery, paginationResult } = apiFeatures;
        const document = await mongooseQuery;

        res.status(200).json({
            results: document.length,
            paginationResult,
            data: document,
        });
    });
