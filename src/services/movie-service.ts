
import { CodeError } from '../lib/custom-error';
import { Request } from "express";
import { Repository, EntityManager } from 'typeorm';
import { Movie } from '../database/entity/movie';
import movies from '../movies.json';
import { validMovie } from '../lib/validation-schema';
import { moveCursor } from 'readline';

export class MovieService {

    private moviesTable: Repository<Movie>;

    constructor(private readonly tx: EntityManager) {
        this.moviesTable = this.tx.getRepository(Movie);
    }

    async getAll(req: Request): Promise<Movie[] | typeof movies> {

        if (Object.keys(req.query).length == 0) {
            return this.moviesTable.find();
        }
        return this.getQueryMovies(req.query)

    }

    async getSingle(id: string): Promise<Movie> {

        const movie = await this.moviesTable.findOneBy({ imdbId: id });
        if (!movie) {
            throw new CodeError(`Movie with imdbID of ${id} not found!`, 400)
        }
        return movie;
    }

    async addMovie(req: Request): Promise<{}> {

        const newMovie: Movie = req.body;

        if ((await this.moviesTable.findBy({ imdbId: newMovie.imdbId })).length) {
            throw new CodeError('Movie Already Exists', 400);
        }

        const { error } = validMovie.validate(newMovie);

        if (error) {
            throw new CodeError(error, 400);
        }

        await this.moviesTable.save(newMovie);

        return { path: `${req.baseUrl}/${req.body.imdbId}` };

    }

    // Add documentation for the method since there are multiple scenarios :)
    async updateOrAdd(req: Request): Promise<{}> {

        const { error } = validMovie.validate(req.body);

        if (error) {
            throw new CodeError(error.details, 400);
        }

        const movieId = req.body.imdbId;

        if ((await this.getSingle(movieId))) {

            await this.editMovie(req.body);
            return {
                status: 'edited',
                data: await this.getSingle(movieId),
                path: `${req.baseUrl}/${req.body.imdbId}`
            }
        }

        await this.addMovie(req.body);

        return {
            status: 'created',
            data: await this.getSingle(movieId),
            path: `${req.baseUrl}/${req.body.imdbId}`
        }
    }

    private async editMovie(editedMovie: Movie): Promise<boolean> {

        try {
            await this.moviesTable.update(editedMovie.imdbId, editedMovie);
        } catch (error) {
            throw new CodeError(error, 500);
        }
        return true;
    }

    async deleteMovie(movieID: string): Promise<{}> {

        if (await (await this.moviesTable.findBy({ imdbId: movieID })).length <= 0)
            throw new CodeError('Movie Does Not Exist', 400);
        try {
            await this.moviesTable.delete({ imdbId: movieID });
        } catch (error) {
            throw new CodeError(error, 500);
        }
        return { success: true };
    }


    //---------------------JSON Reading-----------------------

    //Bellow functions are for accessing JSON file, bcs no such properties in entity

    private filterBy(filter: 'Genre' | 'Actors', value: any): typeof movies {
        return movies.filter((m) => m[filter].includes(value));
    }

    private sortByRating(isASC: boolean, movieList: any[]): { Title: string, imdbRating: string }[] {
        let sortedMovies;

        if (isASC) {
            sortedMovies = movieList
                .sort((movieA: { imdbRating: number; }, movieB: { imdbRating: number; }) => movieA.imdbRating - movieB.imdbRating)
        } else {
            sortedMovies = movieList
                .sort((movieA: { imdbRating: number; }, movieB: { imdbRating: number; }) => movieB.imdbRating - movieA.imdbRating)
        }

        const movieTitleAndRating = sortedMovies
            .map((m) => ({ Title: m.Title, imdbRating: m.imdbRating }))

        return movieTitleAndRating;
    }

    getQueryMovies({ genre, actor, imdbSort }: { genre?: string, actor?: string, imdbSort?: string }): typeof movies {

        let movieList: any = movies;

        if (actor) {
            movieList = this.filterBy('Actors', actor)
        }

        if (genre) {
            movieList = this.filterBy('Genre', genre)
        }

        if (imdbSort) {
            console.log(imdbSort);
            if (imdbSort.toUpperCase() === 'ASC') {

                movieList = this.sortByRating(true, movieList)
            }
            else if (imdbSort.toUpperCase() === 'DESC') {
                movieList = this.sortByRating(false, movieList)
            }
        }

        return movieList;
    }


    getData(type: string): string | {} {

        switch (type) {
            case 'length':
                {
                    const len = movies.reduce((total: number, movie: { Runtime: string; }) => {
                        const movieLen = parseInt(movie.Runtime);
                        return !isNaN(movieLen) ? movieLen + total : total;
                    }, 0)

                    return `${len} min`
                }
            case 'urls':

                return movies.map((movie) => {
                    return `https://www.imdb.com/title/${movie.imdbID}/`;
                });

            case 'votes':

                return {
                    votes: movies.reduce((total: number, movie: any) => {
                        const movieVotes = parseInt(movie.imdbVotes.replace(/,/g, ''));
                        return !isNaN(movieVotes) ? movieVotes + total : total;
                    }, 0)
                };

            case 'languages':
                {

                    const allLanguages = movies.reduce((languages: string | string[], movie: any) => (
                        languages.concat(movie.Language.split(", "))
                    ), [])

                    return [...new Set(allLanguages)];
                }

            default:
                throw new CodeError('Data Type Not Supported', 400)
        }
    }

}
