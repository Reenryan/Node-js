const { count } = require("console");
const express = require(`express`); 
const bodyparser = require(`body-parser`);
let app =express();
const morgan = require(`morgan`);
const moviesRouter =require(`./Routes/moviesRoute`);
const CustomError = require('./Utility/CustomError');
const globalErrorHandler = require(`./Controller/Errorcontroller`);

const logger=function(req,res,next){
    console.log('Custom middleware called');
    next();
}
app.use(express.json());
app.use(bodyparser.json());
/*if(process.env.NODE_ENV ==='development'){
    app.use(morgan(`dev`));
}*/
app.use(morgan(`dev`));

app.use(logger);
app.use(express.static(`./Public`));//to access static files

app.use((req,res,next)=>{
    req.requestedAt=  new Date().toISOString();//tattribute of req.  toISOString convert date to string
    next();
})
//USING ROUTE
app.use('/api/v1/movies',moviesRouter);
app.all('*',(req,res,next)=>{
    /*res.status(404).json({
        status:"fails",
        message:`Can't find  ${req.originalUrl} on the server!`
    })*
    const err = new Error(`Can't find  ${req.originalUrl} on the server!`);
    err.status = 'fails';
    err.statusCode=404;
    next(err);*/
    
    const err = new CustomError(`Can't find  ${req.originalUrl} on the server!`,404);
    next(err);
})
app.use(globalErrorHandler);

//export app
module.exports=app;
