const postgres = require("../database/pool");   // postgres pool instance
// placeholders
const roomRate = {};                            // room rate object


/////////////////////////
//      room rate      //
/////////////////////////

// add new room
roomRate.add = (name, defaultRate) => postgres.query(
    `
	INSERT INTO room_rates (room_name, default_rate)
    VALUES ($1, $2)
    RETURNING room_id;
	`,
    [name, defaultRate]
);

// update room
roomRate.update = (defaultRate, roomID) => postgres.query(
    `
    UPDATE room_rates
    SET default_rate = $1
    WHERE room_id = $2;
	`,
    [defaultRate, roomID]
);

// delete room
roomRate.delete = (roomID) => postgres.query(
    `
	DELETE 
    FROM room_rates 
    WHERE room_id = $1;
	`,
    [roomID]
);

// list room
roomRate.list = () => postgres.query(
    `
	SELECT *
    FROM room_rates;
	`
);


/////////////////////////
//   overridden rate   //
/////////////////////////

// add overridden rate
roomRate.addOverridden = (roomRateID, overriddenRate, stayDate) => postgres.query(
    `
	INSERT INTO overridden_room_rates (room_rate_id, overridden_rate, stay_date)
	VALUES ($1, $2, $3)
    RETURNING orr_id;
	`,
    [roomRateID, overriddenRate, stayDate]
);

// update overridden rate
roomRate.updateOverridden = (overriddenRate, orrID) => postgres.query(
    `
	UPDATE overridden_room_rates
	SET overridden_rate = $1
	WHERE orr_id = $2;
	`,
    [overriddenRate, orrID]
);

// delete overridden rate
roomRate.deleteOverridden = (orrID) => postgres.query(
    `
	DELETE 
    FROM overridden_room_rates 
    WHERE orr_id = $1;
	`,
    [orrID]
);

// list overridden rate
roomRate.listOverridden = () => postgres.query(
    `
	SELECT *
    FROM overridden_room_rates;
	`
);



module.exports = roomRate;