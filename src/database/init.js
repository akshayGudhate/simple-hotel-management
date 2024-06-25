const roomRate = require("./roomRate");		// database - room rates
const discount = require("./discount");		// database - discounts
const master = require("./master");			// database - master


/////////////////////////
//   initialization    //
/////////////////////////

const initDatabase = async () => {
	try {

		//////////////////////////
		//        tables        //
		//////////////////////////

		// room rates
		await roomRate.initTableRoomRates();
		await roomRate.initTableOverriddenRoomRates();
		// discounts
		await discount.initTableDiscounts();
		await discount.initTableDiscountedRoomRates();

		//////////////////////////
		//        indexes       //
		//////////////////////////

		// stay date
		await master.initIndexStayDate();
		// discounted room rates
		await master.initIndexRoomRateDiscount();

		//////////////////////////
		//         views        //
		//////////////////////////

		// discounted rates view
		return master.initViewRoomRatesWithDiscount();

	} catch (err) {
		// throw error
		throw err;
	}
};



module.exports = { initDatabase };