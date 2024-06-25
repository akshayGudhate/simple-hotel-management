const { Pool } = require("pg");					// postgres connection pool
// environment
const projectEnv = require("../environment");	// util - environment


/////////////////////////
//   create new pool   //
/////////////////////////

// create postgres pool
const pool = new Pool({ connectionString: projectEnv.variables.databaseURL });


/////////////////////////
//       on error      //
/////////////////////////

pool.on("error", (err) => {
	console.error(projectEnv.logger.ERROR_DB_OCCURRED, err);
});



module.exports = pool;