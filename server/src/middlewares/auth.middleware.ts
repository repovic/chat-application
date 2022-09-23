import { NextFunction, Request, Response } from "express";
import { userService } from "../services";

export default async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers["X-Access-Token".toLowerCase()] as string;

    if (accessToken)
        await userService
            .validateAccessToken(accessToken)
            .then(({ userId }) => {
                (req as any).userId = userId;
            })
            .catch(() => {});

    next();
};
