import Joi from 'joi';

export const validMovie = Joi.object({
    imdbId: Joi.string()
        .pattern(new RegExp('(tt|nm|co|ev|ch|ni)\\w{5,10}'))
        .required(),
    title: Joi.string()
        .required(),
    year: Joi.number()
        .min(1700)
        .required(),
    runtime: Joi.number()
        .min(5)
        .max(250)
        .required(),
    imdbRating: Joi.number()
        .precision(1)
        .min(0)
        .max(10)
        .required(),
    imdbVotes: Joi.number()
        .required()
});

export const validUpdateMovie = Joi.object({
    imdbId: Joi.forbidden(),
    title: Joi.string().optional(),
    year: Joi.number()
        .min(1700)
        .optional(),
    runtime: Joi.number()
        .min(5)
        .max(250)
        .optional(),
    imdbRating: Joi.number()
        .precision(1)
        .min(0)
        .max(10)
        .optional(),
    imdbVotes: Joi.number()
        .optional()
});
