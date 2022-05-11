import { CodeError } from "../lib/custom-error";
import * as movies from "../services/movie-service";
import { wrap } from "../lib/error-handler";
import { Request, Response } from "express";
import { validMovie } from "../lib/validation-schema";
import { EntityManager } from "typeorm";
import { MovieService } from "../services/movie-service";

/**
 * Notes:
 * - I would prefer to have a class for managing the movies and have the methods inside it
 * - Prefer arrow functions in case it is a single line function, otherwise use the function keyword
 * - Export the function using `export function name() ...` instead of exporting them all at the EOF
 * - It is great that you've tried to have a separate function for each action but 
 *   it is much cleaner and more visible if we have them written in one place (as on the main branch)
 * - There are some unneeded awaits (we use await only if we wait on a resonse from an async action)
 * - Prefer to check equality by type as well, for example use === instead of ==
 * - We don't need to have await if we want to return a value.
 * - A few more written below :)
 */

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
    // what does the validate function return?
    // it is a bit weird to get the error and check if exists
    const { error } = validMovie.validate(req.body);
    if (error) {
        throw new CodeError(error, 400);
    }
    await new MovieService(tx).addMovie(req.body);

    return { path: `${req.baseUrl}/${req.body.imdbId}` };
})

// Add documentation for the method since there are multiple scenarios :)
const updateOrAdd = wrap(async (req: Request, res: Response, tx: EntityManager) => {

    const movieService = new MovieService(tx);

    const { error } = validMovie.validate(req.body);

    if (error) {
        throw new CodeError(error.details, 400);
    }

    const movieId = req.body.imdbId;

    // the first await is not needed since it only checks the length (not an async function)
    if (await (await movieService.getSingle(movieId)).length > 0) {

        await movieService.editMovie(req.body);

        return {
            status: 'edited',
            data: await movieService.getSingle(movieId),
            path: `${req.baseUrl}/${req.body.imdbId}`
        }

    } else {
        // This part should not be in `else` block since it will be executed anyway unless we return a value in the `if` block
        // Maybe split the code in separate function and call them here :) That would improve the readability of the code
        // The best way is to have different methods, one for adding a new movie and one for updating an exiting one
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

    // Here we should return a message to the end user that indicates if the action succeeded or not.
    // {done: true} or {success: true} for example 
    return {};
});

/**
 *  It's better if you write the export right before the function name 
 *  because it would be easier to see if the function is exported
 */
export { getAll, getSingle, getData, addMovie, updateOrAdd, remove }