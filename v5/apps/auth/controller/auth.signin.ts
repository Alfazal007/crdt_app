import { signInTypes } from "@repo/zodtypes";
import type { Request, Response } from "express";
import { tryCatch } from "../tryCatch";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { RedisManager } from "../helpers/redis";

async function signInHandler(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            errors: [
                "request body not provided"
            ]
        })
        return
    }
    const data = req.body
    const parsedData = signInTypes.safeParse(data)
    if (!parsedData.success) {
        const errors: string[] = []
        parsedData.error.errors.forEach((err) => {
            errors.push(err.message)
        })
        res.status(400).json({
            errors
        })
        return
    }
    const userExistsResult = await tryCatch(prisma.user.findFirst({
        where: {
            username: parsedData.data.username
        }
    }))
    if (userExistsResult.error) {
        res.status(500).json({
            errors: ["Issue talking to the database"]
        })
        return
    }
    if (!userExistsResult.data) {
        res.status(404).json({
            errors: ["User with this username could not be found"]
        })
        return
    }
    const isValidPassword = await tryCatch(bcrypt.compare(parsedData.data.password, userExistsResult.data.password))
    if (isValidPassword.error) {
        res.status(500).json({
            errors: ["Issue checking validity of password"]
        })
        return
    }
    if (!isValidPassword.data) {
        res.status(400).json({
            errors: ["Invalid password"]
        })
        return
    }
    const token = jwt.sign({
        username: userExistsResult.data.username,
        id: userExistsResult.data.id
    }, process.env.JWT_SECRET as string, {
        expiresIn: "24h"
    })
    const redisSetResult = await RedisManager.getInstance().setKeyValue(`auth:${userExistsResult.data.id}`, token)
    if (!redisSetResult) {
        res.status(500).json({
            errors: ["Issue talking to redis"]
        })
        return
    }
    res.status(200).cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).json({
        token,
        userId: userExistsResult.data.id
    })
    return
}

export {
    signInHandler
}
