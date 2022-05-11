import Joi from "joi";

// a lot of blank linkes, should not have them
export const validMovie = Joi.object({

    imdbId: Joi.string()
        .pattern(new RegExp('(tt|nm|co|ev|ch|ni)\\w{5,10}')),

    title: Joi.string(),

    year: Joi.number()
        .min(1700),

    runtime: Joi.number()
        .min(5)
        .max(250),

    imdbRating: Joi.number()
        .precision(1)
        .min(0)
        .max(10),

    imdbVotes: Joi.number()

});