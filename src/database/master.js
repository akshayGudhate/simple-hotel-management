const postgres = require("./pool");		// postgres pool instance
// placeholders
const master = {};					    // master object


////////////////////////
//       index's      //
////////////////////////

// index for stay date
master.initIndexStayDate = async () => {
    try {
        // NOTE:
        // usually all our user searches will be on stay date
        // so created index for faster read on dates
        await postgres.query(
            `
            CREATE INDEX IF NOT EXISTS idx_stay_date
            ON overridden_room_rates (stay_date);
            `
        );
    } catch (err) {
        // throw error
        throw err;
    }
};

// room rate discount index
master.initIndexRoomRateDiscount = async () => {
    try {
        // NOTE:
        // this is a composite index on { room_rate_id, discount_id }
        // and will help us finding the room rates and calculate discount faster
        // when queried for discounts
        await postgres.query(
            `
            CREATE INDEX IF NOT EXISTS idx_room_rate_discount
            ON discount_room_rates (room_rate_id, discount_id);
            `
        );
    } catch (err) {
        // throw error
        throw err;
    }
};


////////////////////////
//        views       //
////////////////////////

// room rate with discount view
master.initViewRoomRatesWithDiscount = async () => {
    try {
        // NOTE:
        // created view to have more control over the code,
        // we logically created the query once...
        // hence we can use it anywhere for below fields hereafter
        // fields: { room_id, room_name, final_room_rate, fixed_discount, percentage_discount, effective_date }
        await postgres.query(
            `
            CREATE OR REPLACE VIEW view_room_rates_with_discounts AS (
                SELECT
                    rr.room_id,
                    rr.room_name,
                    COALESCE(orr.overridden_rate, rr.default_rate)      AS final_room_rate,
                    COALESCE(
                        MAX(
                            CASE
                                WHEN d.discount_type = 'fixed'
                                    THEN d.discount_value
                                ELSE 0
                            END
                        ),
                        0
                    )::DECIMAL(10, 2)                                   AS fixed_discount,
                    COALESCE(
                        MAX(
                            CASE
                                WHEN d.discount_type = 'percentage'
                                    THEN (COALESCE(orr.overridden_rate, rr.default_rate) * d.discount_value / 100)
                                ELSE 0
                            END
                        ),
                        0
                    )::DECIMAL(10, 2)                                   AS percentage_discount,
	                COALESCE(orr.stay_date, CURRENT_DATE)               AS effective_date
                FROM room_rates rr
                LEFT OUTER JOIN overridden_room_rates orr
                ON rr.room_id = orr.room_rate_id
                LEFT OUTER JOIN discount_room_rates dr
                ON rr.room_id = dr.room_rate_id
                LEFT OUTER JOIN discounts d
                ON dr.discount_id = d.discount_id
                GROUP BY rr.room_id, rr.room_name, orr.overridden_rate, rr.default_rate, orr.stay_date
           );
            `
        );
    } catch (err) {
        // throw error
        throw err;
    }
};



module.exports = master;