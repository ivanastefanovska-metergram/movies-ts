
import express from "express";
import * as movieController from "../controllers/movie-controller";

const router = express.Router();

router.use(express.json());

// I like the way how this is solved, a different approach :) 
// Although it is more visible if we have defined the endpoints here,
// so that if someone opens the file to be able to see the endpoints and the responses of them
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