
import express from "express";
import { Request, Response } from "express";
import { MovieService } from "../services/movie-service";
import { wrap } from "../lib/error-handler";
import { EntityManager } from "typeorm";
const router = express.Router();

router.use(express.json());

//GET || POST || PUT : /movies
router.route('/')
    .get(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).getAll(req);
    }))
    .post(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).addMovie(req);
    }))
    .put(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).updateOrAdd(req);
    }));

//GET || DELETE :/movies/{imdbId}
router.route('/:imdbId')
    .get(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).getSingle(req.body.imdbId);
    }))
    .delete(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).deleteMovie(req.body.imdbId);
    }))

//GET: /movies/data/{dataType}
router.route('/data/:dataType')
    .get(wrap((req: Request, _: Response, entityManager: EntityManager) => {
        return new MovieService(entityManager).getData(req.params.dataType);
    }));

export { router };