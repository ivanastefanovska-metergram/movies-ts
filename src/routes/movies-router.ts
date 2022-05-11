
import express from "express";
import * as movieController from "../controllers/movie-controller";

const router = express.Router();

router.use(express.json());

router.route('/')
    .get(movieController.getAll)
    .post(movieController.addMovie)
    .put(movieController.updateOrAdd);

router.route('/:imdbId')
    .get(movieController.getSingle)
    .delete(movieController.remove)


router.route('/data/:dataType')
    .get(movieController.getData);

export { router };