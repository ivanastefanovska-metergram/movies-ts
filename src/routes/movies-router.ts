
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
        return new MovieService(entityManager).getAll(req);
    }))
    //POST: /movies
    .post(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).addMovie(req);
    }));

//GET || PATCH || DELETE : /movies/{imdbId}
router.route('/:imdbId')
    .get(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).getSingle(req.params.imdbId);
    }))
    .patch(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).editMovie(req);
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