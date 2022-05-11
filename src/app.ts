import "reflect-metadata";
import express from "express";
import path from "path";
import { router as moviesRouter } from "./routes/movies-router";
import { config } from "../src/config";
import { DatabaseConnection } from "./database/connection";

const app = express();

app.use(express.json());
app.use(express.static(path.resolve("public")));

app.use('/movies', moviesRouter);

// usually we don't serve static html pages from the BE but returning an appropriate error instead
// it is great that you've tried this
app.all('*', (req, res) => {
    res.status(404).sendFile(path.resolve('public/notFound.html'));
});

async function startServer() {
    await new DatabaseConnection().getEntityManager();

    app.listen(config.PORT, () => {
        console.log(`Server on port ${config.PORT}`);
    })
}

startServer();
