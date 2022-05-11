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

            let successResponse: any = {};

            if (Object.keys(result).length > 0) {
                successResponse.response = result;
            } else {
                successResponse.success = true;
            }

            return res.send(successResponse);

        } catch (err) {
            return getErrorHandler(res, err);
        }
    };
}

function getErrorHandler(res: Response, err: any) {
    let code = parseInt(err.statusCode || err.code);
    console.log(err.message);
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
    res.status(code);
    res.send({
        success: false,
        code: code,
        error: err.message
    });
}
