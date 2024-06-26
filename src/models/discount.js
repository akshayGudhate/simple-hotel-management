const postgres = require("../database/pool");   // postgres pool instance
// placeholders
const discount = {};                            // discount object


/////////////////////////
//      discounts      //
/////////////////////////

// add discount record
discount.create = (discountName, discountType, discountValue) => postgres.query(
    `
    INSERT INTO discounts (discount_name, discount_type, discount_value)
    VALUES ($1, $2, $3)
    RETURNING discount_id;
	`,
    [discountName, discountType, discountValue]
);

// update discount record
discount.update = (discountName, discountType, discountValue, discountID) => postgres.query(
    `
    UPDATE discounts
    SET
        discount_name = $1,
        discount_type = $2,
        discount_value = $3
    WHERE discount_id = $4;
	`,
    [discountName, discountType, discountValue, discountID]
);

// delete discount record
discount.delete = (discountID) => postgres.query(
    `
	DELETE 
    FROM discounts 
    WHERE discount_id = $1;
	`,
    [discountID]
);

// get list of records
discount.list = () => postgres.query(
    `
	SELECT *
    FROM discounts;
	`
);


/////////////////////////
//    discount rate    //
/////////////////////////

// add discount room rates
discount.mapRate = (roomRateID, discountID) => postgres.query(
    `
    INSERT INTO discount_room_rates (room_rate_id, discount_id)
    VALUES ($1, $2)
    RETURNING drr_id;
	`,
    [roomRateID, discountID]
);

// lowest room rates after discount
discount.getRoomRatesWithDiscount = async (roomID, startDate, endDate) => {
    // get the room rate discounts
    const result = await postgres.query(
        `
		SELECT *
		FROM view_room_rates_with_discounts
		WHERE 
			room_id = $1 AND
			effective_date BETWEEN $2 AND $3;
		`,
        [roomID, startDate, endDate]
    );

    // calculate final room rate
    return result.rows.map(row => ({
        room_id: row.room_id,
        room_name: row.room_name,
        // NOTE:
        // I have added both discount here..
        // as confused between to add both discounts or only highest discount,
        // so calculated final rate with both ways

        // applied both discounts
        final_rate_both_discount: parseFloat(row.final_room_rate) - (parseFloat(row.fixed_discount) + parseFloat(row.percentage_discount)),
        // applied highest discount
        final_rate_highest_discount: parseFloat(row.final_room_rate) - Math.max(parseFloat(row.fixed_discount), parseFloat(row.percentage_discount))
    }));
};



module.exports = discount;