
import { CodeError } from '../lib/custom-error';
import { Repository, EntityManager } from 'typeorm';
import { Movie } from '../database/entity/movie';
import movies from '../movies.json';

// Add return types on the methods in the class
export class MovieService {

    private moviesTable: Repository<Movie>;

    constructor(private readonly tx: EntityManager) {
        this.moviesTable = this.tx.getRepository(Movie);
    }

    async getAll() {
        return await this.moviesTable.find();
    }

    // id instead of ID
    // unnecessary await after return, the return will wait for the Promise to be fullfiled anyway
    async getSingle(ID: string) {
        return await this.moviesTable.findBy({ imdbId: ID });
    }

    async writeToDB(data: Movie) {
        try {
            await this.moviesTable.save(data);
        } catch (error) {
            // we might want to print the error, so that we know where and on what it failed
            return false;
        }
        return true;
    }

    async addMovie(newMovie: Movie) {

        // similar as above 
        // since this.moviesTable.findBy() returns a Promise we need to wait for it to be resolved
        // that is the `await this.moviesTable.findBy({ imdbId: newMovie.imdbId })` part
        // afterwards we have the value and we can just compare it, we dont need additional await
        // if ((await this.moviesTable.findBy({ imdbId: newMovie.imdbId })).length > 0) {}
        if (await (await this.moviesTable.findBy({ imdbId: newMovie.imdbId })).length > 0) {
            throw new CodeError('Movie Already Exists', 400);
        }
        await this.writeToDB(newMovie);

        // maybe just return this.writeToDB(newMovie); ?
        return true;
    }

    async editMovie(editedMovie: Movie) {

        try {
            await this.moviesTable.update(editedMovie.imdbId, editedMovie);
        } catch (error) {
            throw new CodeError(error, 500);
        }
        return true;
    }

    async deleteMovie(movieID: string) {
        if (await (await this.moviesTable.findBy({ imdbId: movieID })).length <= 0)
            throw new CodeError('Movie Does Not Exist', 400);
        try {
            await this.moviesTable.delete({ imdbId: movieID });
        } catch (error) {
            throw new CodeError(error, 500);
        }
        return true;
    }


}
//---------------------JSON Reading-----------------------


//Bellow functions are for accessing JSON file, bcs no such properties in entity

function filterBy(filter: 'Genre' | 'Actors', value: any) {
    return movies.filter((m) => m[filter].includes(value));
}

function sortByRating(isASC: boolean, movieList: any[]) {
    let sortedMovies;

    if (isASC) {
        sortedMovies = movieList
            .sort((movieA: { imdbRating: number; }, movieB: { imdbRating: number; }) => movieA.imdbRating - movieB.imdbRating)
    } else {
        sortedMovies = movieList
            .sort((movieA: { imdbRating: number; }, movieB: { imdbRating: number; }) => movieB.imdbRating - movieA.imdbRating)
    }

    const movieTitleAndRating = sortedMovies
        .map((m: { Title: any; imdbRating: any; }) => ({ Title: m.Title, imdbRating: m.imdbRating }))

    return movieTitleAndRating;
}

function getQueryMovies({ genre, actor, imdbSort }: { genre?: string, actor?: string, imdbSort?: string }) {

    let movieList: any = movies;

    if (actor) {
        movieList = filterBy('Actors', actor)
    }

    if (genre) {
        movieList = filterBy('Genre', genre)
    }

    if (imdbSort) {
        console.log(imdbSort);
        if (imdbSort.toUpperCase() === 'ASC') {

            movieList = sortByRating(true, movieList)
        }
        else if (imdbSort.toUpperCase() === 'DESC') {
            movieList = sortByRating(false, movieList)
        }
    }

    return movieList;
}

function getData(type: string) {

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



export { getQueryMovies, getData };