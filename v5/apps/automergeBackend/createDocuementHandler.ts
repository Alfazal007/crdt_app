import { prisma } from "@repo/database"
import { serverRepo, type EditorType } from "."
import { RedisManager } from "./helpers/redis"
import { tryCatch } from "./helpers/tryCatch"
import { DocumentManager } from "./managers/DocumentManager"
import { type Request, type Response } from "express"

const createDocHandler = async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(400).json({
            errors: [
                "Request body not found"
            ]
        })
        return
    }
    const { token, userId, docName } = req.body
    if (!token || !userId || !docName) {
        res.status(400).json({
            errors: [
                "token and userId not found"
            ]
        })
        return
    }
    const userIdInt = parseInt(userId)
    if (!userIdInt) {
        res.status(400).json({
            errors: [
                "invalid userId provided"
            ]
        })
        return
    }

    const redisTokenValid = await RedisManager.getInstance().getValue(`auth:${userId}`, token)
    if (!redisTokenValid) {
        res.status(401).json({
            errors: [
                "relogin and try again"
            ]
        })
        return
    }
    const dochandle = serverRepo.create<EditorType>({
        paragraphs: [""]
    })

    const documentIntoDatabase = await tryCatch(prisma.document.create({
        data: {
            creatorId: userIdInt,
            nameOfDocument: docName
        }
    }))
    if (documentIntoDatabase.error) {
        res.status(500).json({
            errors: [
                "issue talking to the database"
            ]
        })
        return
    }
    if (!documentIntoDatabase.data) {
        res.status(500).json({
            errors: [
                "issue talking to the database"
            ]
        })
        return
    }
    DocumentManager.getInstance().addDocumentToUser(dochandle.documentId.toString(), userIdInt, documentIntoDatabase.data.id)
    RedisManager.getInstance().setValue(`${documentIntoDatabase.data.id}`, "1")
    // TODO:: add a new list into the redis pointing to this server
    RedisManager.getInstance().setValue(`${documentIntoDatabase.data.id}`, "1")
    res.status(201).json({
        documentId: dochandle.documentId,
    })
    return
}

export {
    createDocHandler
}
