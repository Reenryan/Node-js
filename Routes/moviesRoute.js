const express =require(`express`);
const moviescontroller = require(`./../Controller/MoviesController`);
const router=express.Router();

//router.param('id',moviescontroller.checkid);

router.route('/highest-rated').get(moviescontroller.getHighestRated,moviescontroller.getAllMovies);
router.route('/movies-stats').get(moviescontroller.getAllMovieStats);


router.route('/').get(moviescontroller.getAllMovies).post(moviescontroller.createMovie);
router.route('/:id').patch(moviescontroller.updateMovie).get(moviescontroller.getMovie).delete(moviescontroller.deleteMovie);
router.route('/movies-genre/:genre').get(moviescontroller.getMoviesByGenre);

module.exports=router;