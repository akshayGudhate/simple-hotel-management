const router = require("express").Router();                                 // express router
// controllers
const controllerRoomRate = require("./controllers/roomRate");               // controller - room rate
const controllerOverriddenRate = require("./controllers/overriddenRate");   // controller - overridden rate
const controllerDiscount = require("./controllers/discount");               // controller - discount
const controllerDiscountedRate = require("./controllers/discountedRate");   // controller - discount rate


////////////////////////
//   handle routers   //
////////////////////////

// route - room rate
router.post('/room-rate', controllerRoomRate.addRoom);
router.patch('/room-rate/:id', controllerRoomRate.updateRoomRate);
router.delete('/room-rate/:id', controllerRoomRate.deleteRoom);
router.get('/room-rate/list', controllerRoomRate.listRooms);

// route - overridden room rate	            
router.post('/overridden-rate', controllerOverriddenRate.addOverriddenRate);
router.patch('/overridden-rate/:id', controllerOverriddenRate.updateOverriddenRate);
router.delete('/overridden-rate/:id', controllerOverriddenRate.deleteOverriddenRate);
router.get('/overridden-rate/list', controllerOverriddenRate.listOverriddenRates);

// route - discounts
router.post('/discount', controllerDiscount.createDiscount);
router.patch('/discount/:id', controllerDiscount.updateDiscount);
router.delete('/discount/:id', controllerDiscount.deleteDiscount);
router.get('/discount/list', controllerDiscount.listDiscounts);

// route - discounted room rate
router.post('/discounted-rate', controllerDiscountedRate.mapRoomRateWithDiscount);
router.get('/discounted-rate/list', controllerDiscountedRate.getRoomRatesWithDiscount);



module.exports = router;