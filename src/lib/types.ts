import { type } from "os";
import movies from '../movies.json';

export type JsonMovieType = typeof movies;

export type MovieQueryType = {
    genre?: string,
    actor?: string,
    imdbSort?: string
}

export type MovieType = {
    imdbId: string
    title: string
    year: string
    runtime: number
    imdbRating: number
    imdbVotes: number
}