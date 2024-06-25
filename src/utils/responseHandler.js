/////////////////////////
//  response handlers  //
/////////////////////////

const responseHandler = (res, statusCode, info, data = null, err) => {
    // only when error
    if (err) console.error(err);
    return res.status(statusCode).json({ info, data });
};



module.exports = responseHandler;