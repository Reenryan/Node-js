const mongoose = require(`mongoose`);
const fs=require(`fs`);
const validator = require(`validator`);
const movieSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:[true ,"name is required"],//validation 
        maxLength:[30,'Movie name cannot exceed 30 characters'],
        minLength:[5,'Movie name must be at least 5 characters'],
        trim:true ,//if whitespaces remove
        //validate:[validator.isAlpha,"Name should only contain alphabets"]
    },
    description:{
        type:String,
        required:[true,"description is a required field"],
        trim:true
    },
    duration:{
        type: Number,
        required:[true,"duration is required field"]
    } ,
    rating:{
        type:Number,
        //default:1.0  ... setting default if not provided by the user
        //min:[1,"Movies rating must be 1 or greater than 1"],
        //max:[10,"Rating must not exceed 10"]
        validate:{
            validator:function(value){//custom validators
          return  value >= 1 && value <=10;
            },
            message:"Rating {VALUE} must be between 1 and 10"
        }
    },
    totalRating:{
        type:Number
    },
    realizeYear:{
        type:Number,
        required:[true,"realize year is a required field"]
    },
    realizeDate:{
        type:Date
    },
    createdAt:{
        type:Date,
        default: Date.now(),
        select:false//hide the data from being displayed to the user
    },
    genres:{
        type:[String],
        required:[true, "Journals are required"],
        enum:{
            values:["Actions","Adventure","Romance","Sci-Fi","Drama","Comedy","Biography","Crime","Thriller","Horrors"],
            message:"This genre does not exist"
    
        }
    },
    directors:{
        type:[String],
        required:[true, "Kindly fill in the directors"]
    },
    coverImage:{
        type:String ,//save the path not the image itself
        required:[true,"Cover image required"]
    },
    actors:{
        type:[String],
        required:[true,"Kindly enter the actors it is required"]
    },
    price:{
        type:Number,
        required:[true,"Price is a required field"]
    },
    createdBy:{
        type:String
    }
    
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
//virtual properties
movieSchema.virtual('durationHrs').get(function(){
    return this.duration/60;  
})

//mongoose middleware pre or post  below :executed before a document is saved  .save()  or .create()
movieSchema.pre('save',function(next){
    // console.log(this);
    this.createdBy="Alexandria";
    next();
})
movieSchema.post('save',function(doc,next){
    const contents=`A new movie by name ${doc.name} has been created by ${doc.createdBy}\n `;
    fs.writeFileSync('./Log/log.txt',contents,{flag:'a'},(err)=>{
        console.log(err.message);
    })
    
    next();
})
//query mongoose middleware 
movieSchema.pre(/^find/,function(next){
    this.find({realizeYear:{$lte: new Date().getFullYear()}});
    this.startTime=  Date.now();
    next();
})
movieSchema.post(/^find/,function(doc,next){
    this.find({realizeYear:{$lte: new Date().getFullYear()}});
    this.EndTime = Date.now();
    const timeTaken =`Query took: ${this.EndTime-this.startTime} milliseconds\n`;
    fs.writeFileSync('./Log/log.txt',timeTaken,{flag:'a'},(err)=>{
        console.log(err.message);
    })
    next();
})
//aggregation middleware 
movieSchema.pre('aggregate',function(next){
    console.log(this.pipeline().unshift({$match:{realizeYear:{$lte:new Date().getFullYear()}}}));
    next();
})

const Movie =mongoose.model('Movie',movieSchema);
module.exports=Movie;