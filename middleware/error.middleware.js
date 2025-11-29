const errorMiddleware = (err, req, res, next) =>{
    try {
        let error = { ...err }
        error.message = err.message
        console.error(err)

        // If no status code was set, default to 500
        error.statusCode = err.statusCode || 500;

        // Mongoose CastError (Invalid MongoDB ID)
        if(err.name === "CastError"){
            const message = 'Resource not Found'
            error = new Error(message)
            error.statusCode = 404;
        }
        // Check for duplicate key error
        if(err.name === 11000){
            const message = 'Duplicate field value entered'
            error = new Error(message)
            error.statusCode = 400
        }
        // Mongoose Validation Error
        if (err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message)
            error = new Error(message.join(', '))
            error.statusCode = 400
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Server Error'
        })

    } catch (error){
        next(error)
    }
}

export default errorMiddleware;