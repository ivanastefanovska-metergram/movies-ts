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

            // We cannot expect to always have Object.keys(result).length of the response
            // If there is an error it will be in the catch block and a message should be sent from there
            // The wrap function should return whatever was received as a response (the logic should stays on a different place)
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

