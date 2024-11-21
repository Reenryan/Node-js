module.exports = (err, req, res, next) => {
  
    // Set default error status code and status
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(err.statusCode===500){
        res.status(500).json({
            status:"Fails",
            message:err.message
        })
    }else{
        // Send the error response
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

    }
  
  
};

/*module.exports=((error,req,res,next)=>{
    error.statusCode = error.statusCode || 500;//default of 500
    error.status =error.status || 'error';
    res.status(error.statusCode).json({
        status:error.statusCode,
        message:error.message
    })
})*/