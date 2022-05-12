import "reflect-metadata";
import express from "express";
import { router as moviesRouter } from "./routes/movies-router";
import { config } from "../src/config";
import { DatabaseConnection } from "./database/connection";

const app = express();

app.use(express.json());

app.use('/movies', moviesRouter);

app.all('*', (_, res) => {
    res.status(404).end();
});

async function startServer() {
    await new DatabaseConnection().getEntityManager();

    app.listen(config.PORT, () => {
        console.log(`Server on port ${config.PORT}`);
    })
}

startServer();
