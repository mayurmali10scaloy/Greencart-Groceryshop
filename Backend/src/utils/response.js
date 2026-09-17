
// Success Response
const successResponse = (
    res,
    message = "Success",
    data = null,
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data,
    });
};

// Error Response
const errorResponse = (
    res,
    message = "Something went wrong",
    statusCode = 500,
    error = null
) => {
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error,
    });
};

module.exports =  {
    successResponse,errorResponse
}