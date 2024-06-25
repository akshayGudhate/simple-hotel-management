const postgres = require("./pool");		// postgres pool instance
// placeholders
const roomRate = {};					// room rate object


/////////////////////////
//        tables       //
/////////////////////////

// room rates table
roomRate.initTableRoomRates = async () => {
	try {
		await postgres.query(
			`
            CREATE TABLE IF NOT EXISTS room_rates(
				room_id 		SERIAL			PRIMARY KEY,
				room_name 		VARCHAR(255)					NOT NULL,
				default_rate 	DECIMAL(10, 2) 					NOT NULL,
                time_stamp		TIMESTAMPTZ						DEFAULT 	CURRENT_TIMESTAMP
            );
            `
		);
	} catch (err) {
		// throw error
		throw err;
	}
};

// overridden room rates table
roomRate.initTableOverriddenRoomRates = async () => {
	try {
		// NOTE:
		// added extra unique constraint to make sure
		// overridden value for one day is not more than one
		// one room rate can be override only once...
		// also, this will help us in calculation query
		await postgres.query(
			`
            CREATE TABLE IF NOT EXISTS overridden_room_rates(
				orr_id 				SERIAL			PRIMARY KEY,
				room_rate_id		INTEGER 		REFERENCES 	room_rates(room_id),
				overridden_rate		DECIMAL(10, 2) 				NOT NULL,
				stay_date			DATE 						NOT NULL,
				time_stamp			TIMESTAMPTZ					DEFAULT 	CURRENT_TIMESTAMP,

    			CONSTRAINT unique_room_date UNIQUE (room_rate_id, stay_date)
            );
            `
		);
	} catch (err) {
		// throw error
		throw err;
	}
};



module.exports = roomRate;