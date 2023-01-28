import {NextFunction, Request, Response} from 'express';

type RouteHandlerFunction = 
    (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: RouteHandlerFunction) => 
    (req: Request, res: Response, next: NextFunction) => 
{
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};
