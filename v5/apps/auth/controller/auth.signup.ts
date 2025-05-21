import type { Request, Response } from "express";
import { signUpTypes } from "@repo/zodtypes"
import { tryCatch } from "../tryCatch";
import { prisma } from "@repo/database"
import bcrypt from "bcryptjs"

async function signupHandler(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            errors: [
                "request body not provided"
            ]
        })
        return
    }
    const data = req.body
    const parsedData = signUpTypes.safeParse(data)
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
    if (userExistsResult.data) {
        res.status(400).json({
            errors: ["User with this username already exists"]
        })
        return
    }
    const hashedPasswordResult = await tryCatch(bcrypt.hash(parsedData.data.password, 12))
    if (hashedPasswordResult.error) {
        res.status(500).json({
            errors: ["Issue hashing the password"]
        })
        return
    }
    const userCreatedResult = await tryCatch(prisma.user.create({
        data: {
            username: parsedData.data.username,
            password: hashedPasswordResult.data
        }
    }))
    if (userCreatedResult.error) {
        res.status(500).json({
            errors: ["Issue talking to the database"]
        })
        return
    }
    res.status(201).json({
        message: "Created the user successfully"
    })
    return
}

export {
    signupHandler
}
