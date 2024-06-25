const express = require("express");					// express server module
const helmet = require("helmet");					// set headers for better security
const compression = require("compression");			// compressed assets
const cors = require("cors");						// cors for react integration
// database
const database = require("./src/database/init");	// database
// routers
const apiRouter = require("./src/apiRouter");		// router - api
// environment
const projectEnv = require("./src/environment");	// util - environment


/////////////////////////
//         app         //
/////////////////////////

const app = express();


/////////////////////////
//     middlewares     //
/////////////////////////

app.use(
	helmet(),										// middleware - security headers
	compression(),									// middleware - compression for assets
	express.json(),									// middleware - body parser: json data
	express.urlencoded({ extended: true }),			// middleware - body parser: url-encoded data
	cors()											// middleware - cors for react integration
);


/////////////////////////
//      api routes     //
/////////////////////////

app.use("/api/v1", apiRouter);						// router - api version-1


/////////////////////////
//     start server    //
/////////////////////////

const startServer = async (port) => {
	try {
		// initialize database
		await database.initDatabase();

		// register http listener
		app.listen(port, () => console.info(projectEnv.logger.INFO_SERVER_START(port)));
	} catch (err) {
		// error
		console.error(projectEnv.logger.ERROR_SERVER_NOT_STARTED, err);
	}
};

//
// call start server
//
startServer(projectEnv.variables.port);