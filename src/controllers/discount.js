// models
const modelDiscount = require("../models/discount");			// model - room rate
// utils
const responseHandler = require("../utils/responseHandler");	// util - response handler
// environment
const projectEnv = require("../environment");					// environment


//////////////////////
//     discount     //
//////////////////////

const createDiscount = async (req, res) => {
	try {
		// parse details
		const { discountName, discountType, discountValue } = req.body;

		// check for correct discount type
		if (!(discountType in projectEnv.allDiscountTypes)) {
			// send http response
			return responseHandler(res, projectEnv.http.CODE_400, projectEnv.logger.MESSAGE_INVALID_TYPE);
		};

		// check discount value
		if (discountType == projectEnv.allDiscountTypes.percentage && (discountValue < 0 || discountValue >= 100)) {
			// send http response
			return responseHandler(res, projectEnv.http.CODE_400, projectEnv.logger.MESSAGE_INVALID_VALUE);
		};

		//
		// create new discount
		//
		const roomID = (await modelDiscount.create(discountName, discountType, discountValue)).rows[0].discount_id;

		// send http response
		return responseHandler(res, projectEnv.http.CODE_201, projectEnv.logger.MESSAGE_CREATE_DISCOUNT, { roomID });
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const updateDiscount = async (req, res) => {
	try {
		// parse details
		const { discountValue } = req.body;

		// update discount
		await modelDiscount.update(discountValue, req.params.id);

		// send http response
		return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_UPDATE_DISCOUNT);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const deleteDiscount = async (req, res) => {
	try {
		// delete discount
		await modelDiscount.delete(req.params.id);

		// send http response
		return responseHandler(res, projectEnv.http.CODE_204, projectEnv.logger.MESSAGE_DELETE_DISCOUNT);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const listDiscounts = async (_req, res) => {
	try {
		// list discounts
		const discountList = (await modelDiscount.list()).rows;

		// check for the data
		if (discountList.length == 0) {
			// send http response
			return responseHandler(res, projectEnv.http.CODE_404, projectEnv.logger.MESSAGE_NO_DATA, []);
		};

		// send http response
		return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_LIST_DISCOUNTS, discountList);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};



module.exports = { createDiscount, updateDiscount, deleteDiscount, listDiscounts };