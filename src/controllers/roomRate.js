// models
const modelRoomRate = require("../models/roomRate");			// model - room rate
// utils
const responseHandler = require("../utils/responseHandler");	// util - response handler
// environment
const projectEnv = require("../environment");					// environment


//////////////////////
//       room       //
//////////////////////

const addRoom = async (req, res) => {
	try {
		// parse details
		const { name, defaultRate } = req.body;

		// check rate value
		if (defaultRate <= 0) {
			// send http response
			return responseHandler(res, projectEnv.http.CODE_400, projectEnv.logger.MESSAGE_INVALID_ROOM_RATE);
		};

		// add new room
		const roomID = (await modelRoomRate.add(name, defaultRate)).rows[0].room_id;

		// send http response
		return responseHandler(res, projectEnv.http.CODE_201, projectEnv.logger.MESSAGE_ADD_ROOM, { roomID });
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const updateRoomRate = async (req, res) => {
	try {
		// parse details
		const { defaultRate } = req.body;

		// check rate value
		if (defaultRate <= 0) {
			// send http response
			return responseHandler(res, projectEnv.http.CODE_400, projectEnv.logger.MESSAGE_INVALID_ROOM_RATE);
		};

		// update room rate
		await modelRoomRate.update(defaultRate, req.params.id);

		// send http response
		return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_UPDATE_ROOM_RATE);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const deleteRoom = async (req, res) => {
	try {
		// delete room
		await modelRoomRate.delete(req.params.id);

		// send http response
		return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_DELETE_ROOM);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};

const listRooms = async (_req, res) => {
	try {
		// list room rates
		const roomList = (await modelRoomRate.list()).rows;

		// check for the data
		if (roomList.length == 0) {
			// send http response
			return responseHandler(res, projectEnv.http.CODE_404, projectEnv.logger.MESSAGE_NO_DATA, []);
		};

		// send http response
		return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_LIST_ROOMS, roomList);
	} catch (err) {
		// send http response
		return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
	}
};



module.exports = { addRoom, updateRoomRate, deleteRoom, listRooms };