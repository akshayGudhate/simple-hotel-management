require("dotenv").config();     // environment variables


/////////////////////////
//    env variables    //
/////////////////////////

// extract environment object from process
const PEO = process.env;

// set variables
const variables = {
	// application
	port: PEO.PORT || 8080,
	// database
	databaseURL: PEO.DATABASE_URL
};


// http codes
const http = {
	CODE_200: 200, CODE_201: 201,
	CODE_400: 400, CODE_404: 404, CODE_409: 409,
	CODE_500: 500
};

// logger
const logger = {
	// messages
	MESSAGE_NO_DATA: "No data found!",
	MESSAGE_INVALID_ROOM_RATE: "Invalid room rate value, please enter a value greater than 0",
	MESSAGE_INVALID_DISCOUNT_TYPE: "Invalid discount type, please choose the correct one.",
	MESSAGE_INVALID_DISCOUNT_VALUE: "Invalid discount value, please enter a discount value greater than 0 for fixed and between 0 to 100 for percentage type.",
	MESSAGE_ADD_ROOM: "New room added successfully!",
	MESSAGE_UPDATE_ROOM_RATE: "Room rate updated successfully!",
	MESSAGE_DELETE_ROOM: "Room deleted successfully!",
	MESSAGE_LIST_ROOMS: "Room list fetched successfully!",
	MESSAGE_ADD_ORR: "New overridden rate added successfully!",
	MESSAGE_UPDATE_ORR: "Overridden rate updated successfully!",
	MESSAGE_DELETE_ORR: "Overridden rate deleted successfully!",
	MESSAGE_LIST_ORR: "Overridden rate list fetched successfully!",
	MESSAGE_CREATE_DISCOUNT: "New discount created successfully!",
	MESSAGE_UPDATE_DISCOUNT: "Discount updated successfully!",
	MESSAGE_DELETE_DISCOUNT: "Discount deleted successfully!",
	MESSAGE_LIST_DISCOUNTS: "Discount list fetched successfully!",
	MESSAGE_MAP_DISCOUNT: "Discount mapped to rooms successfully!",
	MESSAGE_GET_RATE_WITH_DISCOUNT: "Discounted room rates fetched successfully!",
	MESSAGE_INTERNAL_ERROR: "Something went wrong. An error has occurred.",

	// errors
	ERROR_DB_OCCURRED: "Database error found!\n",
	ERROR_DUPLICATE_KEY: "duplicate key value violates unique constraint",
	ERROR_INVALID_KEY: "violates foreign key constraint",
	ERROR_SERVER_NOT_STARTED: "Failed to start server!\n",

	// info
	INFO_SERVER_START: (port) => `🚀 Server listening on port: ${port}`
};


// discount types
const allDiscountTypes = { fixed: "fixed", percentage: "percentage" };



module.exports = { variables, http, logger, allDiscountTypes };