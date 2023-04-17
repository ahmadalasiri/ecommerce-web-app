const SubCategory = require("../models/subCategoryModel");
const factory = require("./handlersFactory");

// Nested route
// GET    /api/v1/categories/:categoryId/subcategories
exports.createFilterObject = (req, res, next) => {
    let filterObject = {};
    if (req.params.categoryId)
        filterObject = { mainCategory: req.params.categoryId };
    req.filterObject = filterObject;
    next();
};

/**
 *  @description    Get list of SubCategory
 *  @route          GET/api/v1/subCategory
 *  @access         Public
 */
exports.getSubCategories = factory.getAll(SubCategory);

/**
 *  @description    Get SubCategory
 *  @route          GET/api/v1/subCategory/:id
 *  @access         Public
 */
exports.getSubCategory = factory.getOne(SubCategory);

exports.setCategoryToBody = (req, res, next) => {
    // Nested route
    if (!req.body.mainCategory) req.body.mainCategory = req.params.categoryId;
    next();
};
/**
 *  @description Create SubCategory
 *  @route       POST /api/v1/subCategory
 *  @access      Private/Admin-Manager
 */
exports.createSubCategory = factory.createOne(SubCategory);

/**
 *  @description Update SubCategory
 *  @route       POST /api/v1/subCategory/:id
 *  @access      Private/Admin-Manager
 */
exports.updateSubCategory = factory.updateOne(SubCategory);

/**
 *  @description Delete SubCategory
 *  @route       POST /api/v1/subCategory/:id
 *  @access      Private/Admin
 */
exports.deleteSubCategory = factory.deleteOne(SubCategory);
