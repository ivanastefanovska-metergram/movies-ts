import { Request, Response } from "express";
import { DatabaseConnection } from "../database/connection";

export function wrap(handler: any) {
    return async (req: Request, res: Response) => {
        try {
            const entityManager = await new DatabaseConnection().getEntityManager();
            const result = await handler(req, res, entityManager);
            const responseBody = JSON.stringify(result);
            res.set({
                "Content-Type": "application/json",
                "Content-Length": responseBody.length
            });
            res.status(200);

            return res.send(result);

        } catch (err) {
            return getErrorHandler(res, err);
        }
    };
}

function getErrorHandler(res: Response, err: any) {
    let code = parseInt(err.statusCode || err.code);

    if (typeof code !== "number" || isNaN(code)) {
        code = 500;
        console.error([
            "Unexpected error thrown",
            "Code 500",
            `Message ${err.message}`,
            `Stack ${err.stack}`,
            `Raw ${err}`,
        ].join("\n"));
    }
    res.status(code || 500);
    res.send({
        success: false,
        code: code,
        error: err.message
    });
}

