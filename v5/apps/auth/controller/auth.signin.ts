import type { Request, Response } from "express";

function signInHandler(req: Request, res: Response) {
    res.status(200).json({
        message: "working route for signin"
    })
    return
}

export {
    signInHandler
}
