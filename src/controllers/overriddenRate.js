// models
const modelRoomRate = require("../models/roomRate");			// model - room rate
// utils
const responseHandler = require("../utils/responseHandler");	// util - response handler
// environment
const projectEnv = require("../environment");					// environment


///////////////////////
//  overridden rate  //
///////////////////////

const addOverriddenRate = async (req, res) => {
	try {
		// parse details
		const { roomRateID, overriddenRate, stayDate } = req.body;

		// add new overridden rate
		const orrID = (await modelRoomRate.addOverridden(roomRateID, overriddenRate, stayDate)).rows[0].orr_id;

		// send http response
		return responseHandler(res, projectEnv.http.CODE_201, projectEnv.logger.MESSAGE_ADD_ORR, { orrID });
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const updateOverriddenRate = async (req, res) => {
	try {
		// parse details
		const { overriddenRate } = req.body;

		// update overridden rate
		await modelRoomRate.updateOverridden(overriddenRate, req.params.id);

		// send http response
		return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_UPDATE_ORR);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const deleteOverriddenRate = async (req, res) => {
	try {
		// delete overridden rate
		await modelRoomRate.deleteOverridden(req.params.id);

		// send http response
		return responseHandler(res, projectEnv.http.CODE_204, projectEnv.logger.MESSAGE_DELETE_ORR);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const listOverriddenRates = async (_req, res) => {
	try {
		// list overridden rate
		const overriddenRateList = (await modelRoomRate.listOverridden()).rows;

		// check for the data
        if (overriddenRateList.length == 0) {
            // send http response
            return responseHandler(res, projectEnv.http.CODE_404, projectEnv.logger.MESSAGE_NO_DATA, []);
        };

		// send http response
		return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_LIST_ORR, overriddenRateList);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};



module.exports = { addOverriddenRate, updateOverriddenRate, deleteOverriddenRate, listOverriddenRates };