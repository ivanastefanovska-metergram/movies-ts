// import * as migrations from "./migrations";
import * as entities from "./entity/movie";
import { createConnection, getConnection, QueryRunner, Connection, ConnectionOptions } from "typeorm";

export const dbConfig: ConnectionOptions = {
    type: "postgres",
    host: "localhost",
    port: 3000,
    username: "postgres",
    password: "privremen",
    database: "Movie",
    entities: [entities.Movie],
    synchronize: true,
    logging: false,
    subscribers: [],
    migrations: [],
};

export class DatabaseConnection {
    constructor() { }

    private async tryGetExistingConnection() {
        try {
            const connection = getConnection();
            if (!connection.isConnected) {
                return connection.connect();
            }

            return connection;
        } catch (e) {
            return null;
        }
    }

    async getEntityManager() {
        const existingConnection = await this.tryGetExistingConnection();
        if (existingConnection) {
            return existingConnection.createEntityManager();
        }
        const connection = await createConnection(dbConfig);

        // await connection.runMigrations();

        return connection.createEntityManager();
    }

}
