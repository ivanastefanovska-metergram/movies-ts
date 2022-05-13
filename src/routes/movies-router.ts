import express from "express";
import { Request, Response } from "express";
import { MovieService } from "../services/movie-service";
import { wrap } from "../lib/error-handler";
import { EntityManager } from "typeorm";
const router = express.Router();

router.use(express.json());


router.route('/')
    // GET: /movies                          or
    // GET: /movies?{actor=Actor Name}       or
    // GET: /movies?{genre=Genre}            or
    // GET: /movies?{imdbSort=ASC || DESC }  or
    .get(wrap((req: Request, _: Response, entityManager: EntityManager) => {

        const movieService = new MovieService(entityManager);
        if (Object.keys(req.query).length) {
            return movieService.getAllMovies()
        }
        return movieService.getQueryMovies(req.query);
    }))
    //POST: /movies
    .post(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).addMovie(req.baseUrl, req.body);
    }))
    //PUT: /movies
    .put(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).editOrAddMovie(req.params, req.baseUrl, req.body);
    }));

//GET || PATCH || DELETE : /movies/{imdbId}
router.route('/:imdbId')
    .get(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).getSingleMovie(req.params.imdbId);
    }))
    .patch(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).editMovie(req.params, req.baseUrl, req.body);
    }))
    .delete(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).deleteMovie(req.params.imdbId);
    }));


//GET: /movies/data/{dataType}
router.route('/data/:dataType')
    .get(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).getData(req.params.dataType);
    }));

export { router };