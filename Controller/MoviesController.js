const ApiFeatures=require('../Utility/ApiFeatures');
const Movie =require(`./../Models/movieModel`);
const asyncErrorHandler =require(`../Utility/asyncErrorHandler`);

exports.getHighestRated= (req,res,next)=>{
    req.query.limit='2';
    req.query.sort='-rating';

    next();
}

exports.getAllMovies= asyncErrorHandler(async(req,res)=>{
        /*const features= new ApiFeatures(Movie.find(),req.query)
        .sort()
        .limitFields()
        .paginate()
        .filter();
        let movies= await features.query;
        console.log(features.query);
        console.log(movies);*/
        
       /*console.log(req.query);
        const movies= await Movie.find({duration:+req.query.duration,rating:+req.query.rating});
         const exclude fields=["sort","limit","page","fields"];

        const queryObject={...req.query};        exclude fields.forEach((fields)=>{
            delete queryObject[fields];
        });
        console.log(queryObject);
        const movies= await Movie.find(queryObject);
        const movies= await Movie.find(req.query);

        
        above approach use movies/?duration[gte]=110&rating[gte]=5.6&price[lte]=100 as the url
        
        const movies= await Movie.find(query Obj);
        Movie.find({queryObject:{duration:{$gte:110},rating:{$gte:5.6},price:{$lte:100}}});
        
       const movies= await Movie.find()
                    .where('duration')
                    .gte(req.query.duration)
                    .where('rating')
                    .gte(req.query.rating)
                    .where('price')
                    .lte(req.query.price*/
        

        let query = Movie.find();

        if (req.query.duration) {
            query.where('duration').gte(Number(req.query.duration));
        }
        if (req.query.rating) {
            query.where('rating').gte(Number(req.query.rating));
        }
        if (req.query.price) {
            query.where('price').lte(Number(req.query.price)); // assuming you want movies priced less than or equal to the specified price
        }
        if (req.query.sort) {
            const sortFields = req.query.sort.split(',').join(' ');
            query=query.sort(sortFields);
        } else {
            query.sort('-createdAt');
        }
    
        //LIMITING FIELDS
       if(req.query.fields){
            //query.select('name duration price rating');
            const fields=req.query.fields.split(',').join(' ');
            query=  query.select(fields);//projection display only the included
            console.log(fields);
        }else{
            query=query.select("-__v");//- to specify exclude __v
        }

        //pagination
        const page= req.query.page*1 || 1; //if the user does not specify a page the default is one same to limit
        const limit = req.query.limit*1 || 10;
        
        //page 1 :1-10 ,page 2: 11-20,page 3: 21-30
        //query= query.skip(10).limit(10);
        const skip=(page-1)*limit;
        query= query.skip(skip).limit(limit);
        if(req.query.page){
            const moviesCount = await Movie.countDocuments();//return the number of documents stored in the dbs
            if(skip>=moviesCount){
                throw new Error("This page is not found");
                
            }
        }

        const movies = await query.exec();

        // Step 4: Send response with found movies
        res.status(200).json({
            status: "success",
            length: movies.length,
            data: {
                movies
            }
        });
});

exports.getMovie=  asyncErrorHandler(async(req,res,next)=>{
        //const movie = await Movie.find({_id : req.params.id})
        const movie = await Movie.findById(req.params.id);
        res.status(200).json({
            status:"success",
            data:{
                movie
            }
        });
   
});

exports.createMovie =async (req,res)=>{
    try {
        const movie= await Movie.create(req.body,{new:true,runValidators:true});
        res.status(201).json({
         status:"Success",
         data:{
            movie //variable name is same no need to specify...movie data: movie 
         }
 
        })
        
    } catch (error) {
            if (error.name === 'MongoError' && error.code === 11000) {
                res.status(400).json({
                    status: "fails",
                    message: `Duplicate field value: ${JSON.stringify(error.keyValue)}`
                });
            }
            // Handle other types of errors (validation, cast errors, etc.)
            else {
                res.status(404).json({
                    status: "fails",
                    message: error.message
                });
        }
    }

};

exports.updateMovie =asyncErrorHandler(async (req,res,next)=>{
        const updatedMovie= await Movie.findByIdAndUpdate(req.params.id, req.body,{new:true,runValidators:true});
        res.status(200).json({
            status:"success",
            data:{
                 updatedMovie
            }
        })        
});


exports.deleteMovie=asyncErrorHandler(async (req,res,next)=>{
         await Movie.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status:"success",
            data:null
        })

});

exports.getAllMovieStats=asyncErrorHandler(async (req,res)=>{
        const stats = await Movie.aggregate([
           // {$match:{realizeYear:{$lte: new Date().getFullYear()}}},
            {$match :{rating:{$gte:4.5}}},
            {$group :{
                _id:'$realizeYear',
                avgRating:{$avg:'$rating'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'},
                priceTotal:{$sum:'$price'},
                moviesCount:{$sum:1}
             }
          },
          {$sort:{minPrice:1}},
        //  {$match :{maxPrice:{$gte:100}}}
        ]);

        res.status(200).json({
            status:"success",
            length:stats.length,
            data:{
                stats
            }
        });
});

exports.getMoviesByGenre =asyncErrorHandler(async (req, res,next) => {
        const genre = req.params.genre;
        const movies = await Movie.aggregate([
            { $unwind: '$genres' },
            {$group:{
                _id:'$genres',
                movieCount:{$sum:1},
                movies:{$push:'$name'}
            }},
            {$addFields:{genre:'$_id'}},
            {$project:{_id:0}},//specify values to be displayed 0 for false
            {$sort :{movieCount:-1}},
            //{$limit:2}
            {$match:{genre:genre}}
        ]);

        res.status(200).json({
            status: "success",
            length: movies.length,
            data: {
                movies
            }
        });

});
