// models
const modelDiscount = require("../models/discount");            // model - discount
// utils
const responseHandler = require("../utils/responseHandler");    // util - response handler
// environment
const projectEnv = require("../environment");                   // environment


//////////////////////
//  discount rates  //
//////////////////////

const mapRoomRateWithDiscount = async (req, res) => {
    try {
        // parse details
        const { roomRateID, discountID } = req.body;

        // map discount to room rate
        const drrID = (await modelDiscount.mapRate(roomRateID, discountID)).rows[0].drr_id;

        // send http response
        return responseHandler(res, projectEnv.http.CODE_201, projectEnv.logger.MESSAGE_MAP_DISCOUNT, { drrID });
    } catch (err) {
        // if duplicate entry
        if (err.message.includes(projectEnv.logger.ERROR_INVALID_KEY)) {
            // send http response
            return responseHandler(res, projectEnv.http.CODE_409, err.detail, null);
        };

        // send http response
        return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
    }
};

const getRoomRatesWithDiscount = async (req, res) => {
    try {
        // parse details
        const { roomID, startDate, endDate } = req.query;

        // get organization list
        const discountedRates = await modelDiscount.getRoomRatesWithDiscount(roomID, startDate, endDate);

        // check for the data
        if (discountedRates.length == 0) {
            // send http response
            return responseHandler(res, projectEnv.http.CODE_404, projectEnv.logger.MESSAGE_NO_DATA, []);
        };

        // send http response
        return responseHandler(res, projectEnv.http.CODE_200, projectEnv.logger.MESSAGE_GET_RATE_WITH_DISCOUNT, discountedRates);
    } catch (err) {
        // send http response
        return responseHandler(res, projectEnv.http.CODE_500, projectEnv.logger.MESSAGE_INTERNAL_ERROR, null, err);
    }
};



module.exports = { mapRoomRateWithDiscount, getRoomRatesWithDiscount };