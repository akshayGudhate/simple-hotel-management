const postgres = require("./pool");		// postgres pool instance
// placeholders
const discount = {};					// discount object


/////////////////////////
//        tables       //
/////////////////////////

// discounts table
discount.initTableDiscounts = async () => {
	try {
		await postgres.query(
			`
            CREATE TABLE IF NOT EXISTS discounts(
				discount_id 	SERIAL 			PRIMARY KEY,
				discount_name 	VARCHAR(255) 					NOT NULL,
				discount_type 	VARCHAR(50) 					NOT NULL 	CHECK (discount_type IN ('fixed', 'percentage')),
				discount_value 	DECIMAL(10, 2) 					NOT NULL,
				time_stamp		TIMESTAMPTZ						DEFAULT		CURRENT_TIMESTAMP
            );
            `
		);
	} catch (err) {
		// throw error
		throw err;
	}
};

// discounted room rates table
discount.initTableDiscountedRoomRates = async () => {
	try {
		await postgres.query(
			`
            CREATE TABLE IF NOT EXISTS discount_room_rates(
				drr_id 			SERIAL			PRIMARY KEY,
				room_rate_id	INTEGER 		REFERENCES room_rates(room_id),
				discount_id		INTEGER 		REFERENCES discounts(discount_id),
				time_stamp		TIMESTAMPTZ				DEFAULT		CURRENT_TIMESTAMP
            );
            `
		);
	} catch (err) {
		// throw error
		throw err;
	}
};



module.exports = discount;