
import { CodeError } from '../lib/custom-error';
import { Request } from "express";
import { Repository, EntityManager } from 'typeorm';
import { Movie } from '../database/entity/movie';
import movies from '../movies.json';
import { validMovie, validUpdateMovie } from '../lib/validation-schema';
import { JsonMovieType, MovieQueryType, MovieType } from '../lib/types';

export class MovieService {

    private moviesRepository: Repository<Movie>;

    constructor(private readonly tx: EntityManager) {
        this.moviesRepository = this.tx.getRepository(Movie);
    }

    async getAll(req: Request): Promise<MovieType[] | JsonMovieType> {

        if (Object.keys(req.query).length === 0) {
            return this.moviesRepository.find();
        }
        return this.getQueryMovies(req.query)

    }

    async getSingle(id: string): Promise<MovieType> {

        const movie = await this.moviesRepository.findOneBy({ imdbId: id });
        if (!movie) {
            throw new CodeError(`Movie with imdbID of ${id} not found!`, 400)
        }
        return movie;
    }

    async addMovie(req: Request): Promise<{}> {

        const newMovie: Movie = req.body;

        const { error } = validMovie.validate(newMovie);

        if (error) {
            console.error(error);
            throw new CodeError(error, 400);
        }

        if ((await this.moviesRepository.findBy({ imdbId: newMovie.imdbId })).length) {
            throw new CodeError('Movie Already Exists', 400);
        }

        await this.moviesRepository.save(newMovie);

        return {
            status: 'created',
            data: newMovie,
            path: `${req.baseUrl}/${req.body.imdbId}`
        }

    }

    async editMovie(req: Request): Promise<any> {

        const movieId: string = req.params.imdbId;

        await this.getSingle(movieId);

        const editedMovie = req.body;
        const { error } = validUpdateMovie.validate(editedMovie);
        if (error) {
            console.error(error);
            throw new CodeError(error.details[0].message, 400);
        }

        try {
            await this.moviesRepository.update({
                imdbId: movieId
            }, {
                title: editedMovie.title,
                year: editedMovie.year,
                runtime: editedMovie.runtime,
                imdbRating: editedMovie.imdbRating,
                imdbVotes: editedMovie.imdbVotes
            })
        } catch (error) {
            console.error(error);
            throw new CodeError(error, 500);
        }
        return {
            status: 'edited',
            data: editedMovie,
            path: `${req.baseUrl}/${movieId}`
        }
    }

    async deleteMovie(id: string): Promise<{}> {

        if ((await this.moviesRepository.findBy({ imdbId: id })).length)
            throw new CodeError('Movie Does Not Exist', 400);
        try {
            await this.moviesRepository.delete({ imdbId: id });
        } catch (error) {
            console.error(error);
            throw new CodeError(error, 500);
        }
        return { success: true };
    }


    //---------------------JSON Reading-----------------------

    //Bellow functions are for accessing JSON file, bcs no such properties in entity

    private filterMovieBy(filter: 'Genre' | 'Actors', value: string, movie: JsonMovieType): JsonMovieType {
        return movie.filter((m) => m[filter].includes(value));
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

    getQueryMovies({ genre, actor, imdbSort }: MovieQueryType): JsonMovieType {

        let movieList: any = movies;

        if (actor) {
            movieList = this.filterMovieBy("Actors", actor, movieList);
        }

        if (genre) {
            movieList = this.filterMovieBy("Genre", genre, movieList);
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
