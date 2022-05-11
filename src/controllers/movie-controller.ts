import { CodeError } from "../lib/custom-error";
import * as movies from "../services/movie-service";
import { wrap } from "../lib/error-handler";
import { Request, Response } from "express";
import { validMovie } from "../lib/validation-schema";
import { EntityManager } from "typeorm";
import { MovieService } from "../services/movie-service";

const getAll = wrap((req: Request, res: Response, tx: EntityManager) => {
    if (Object.keys(req.query).length == 0) {
        return new MovieService(tx).getAll();
    }
    return movies.getQueryMovies(req.query)
})

const getSingle = wrap(async (req: Request, res: Response, tx: EntityManager) => {

    const imdbID = req.params.imdbId;
    const movie = await new MovieService(tx).getSingle(imdbID);
    if (movie.length <= 0) {
        throw new CodeError(`Movie with imdbID of ${imdbID} not found!`, 400)
    }
    return movie;
})

const getData = wrap((req: Request, res: Response, tx: EntityManager) => {
    return movies.getData(req.params.dataType);
})

const addMovie = wrap(async (req: Request, res: Response, tx: EntityManager) => {

    const { error } = validMovie.validate(req.body);
    if (error) {
        throw new CodeError(error, 400);
    }
    await new MovieService(tx).addMovie(req.body);

    return { path: `${req.baseUrl}/${req.body.imdbId}` };
})

const updateOrAdd = wrap(async (req: Request, res: Response, tx: EntityManager) => {

    const movieService = new MovieService(tx);

    const { error } = validMovie.validate(req.body);

    if (error) {
        throw new CodeError(error.details, 400);
    }

    const movieId = req.body.imdbId;

    if (await (await movieService.getSingle(movieId)).length > 0) {

        await movieService.editMovie(req.body);

        return {
            status: 'edited',
            data: await movieService.getSingle(movieId),
            path: `${req.baseUrl}/${req.body.imdbId}`
        }

    } else {

        await movieService.addMovie(req.body);

        return {
            status: 'created',
            data: await movieService.getSingle(movieId),
            path: `${req.baseUrl}/${req.body.imdbId}`
        }
    }

})

const remove = wrap(async (req: Request, res: Response, tx: EntityManager) => {

    await new MovieService(tx).deleteMovie(req.body.imdbId);

    return {};
});



export { getAll, getSingle, getData, addMovie, updateOrAdd, remove }