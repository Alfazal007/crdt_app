import { prisma } from "@repo/database"
import { serverRepo } from "."
import { RedisManager } from "./helpers/redis"
import { tryCatch } from "./helpers/tryCatch"
import { DocumentManager } from "./managers/DocumentManager"
import type { DocumentId } from "@automerge/automerge-repo"
import { CloudinaryManager } from "./managers/CloudinaryManager"
import { next as Automerge } from "@automerge/automerge"
import { type Request, type Response } from "express"

const editDocHandler = async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(400).json({
            errors: [
                "Request body not found"
            ]
        })
        return
    }
    const { token, userId, documentId } = req.body
    if (!token || !userId || !documentId) {
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
    const documentIdInt = parseInt(documentId)
    if (!documentIdInt) {
        res.status(400).json({
            errors: [
                "invalid documentId provided"
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
    let fetchFromCloudinary = false
    // check if the doc exists in the file if not check database authentications

    let docIdString = DocumentManager.getInstance().getDocId(documentIdInt)
    console.log({ docIdString })
    const existsDocument = await tryCatch(serverRepo.find(docIdString as DocumentId))
    console.log({ existsDocument })
    if (existsDocument.error || !existsDocument.data) {
        // does not exist
        const databaseExistingResult = await tryCatch(prisma.document.findFirst({
            where: {
                id: documentId
            }
        }))
        if (databaseExistingResult.error) {
            res.status(500).json({
                errors: [
                    "issue talking to the database"
                ]
            })
            return
        }
        if (!databaseExistingResult.data) {
            res.status(404).json({
                errors: [
                    "not found"
                ]
            })
            return
        }
        if (databaseExistingResult.data.creatorId == userId) {
            fetchFromCloudinary = true
        }
        if (!fetchFromCloudinary) {
            // check access
            const accessAllowedResult = await tryCatch(prisma.access.findFirst({
                where: {
                    documentId,
                    creatorId: userId
                }
            }))
            if (accessAllowedResult.error) {
                res.status(500).json({
                    errors: [
                        "issue talking to the database"
                    ]
                })
                return
            }
            if (!accessAllowedResult.data) {
                res.status(401).json({
                    errors: [
                        "unauthorized"
                    ]
                })
                return
            }
            fetchFromCloudinary = true
        }
        if (!fetchFromCloudinary) {
            res.status(401).json({
                errors: [
                    "unauthorized"
                ]
            })
            return
        }
        const dataExistsInCloudinary = await CloudinaryManager.getInstance().resourceExists(`data/${documentId}`)
        if (!dataExistsInCloudinary) {
            res.status(404).json({
                errors: [
                    "not found in cloudinary"
                ]
            })
            return
        }
        const [cloudinaryUint8Data, found] = await CloudinaryManager.getInstance().downloadAndConvertToUint8Array(`data/${documentId}`)
        if (!found || !cloudinaryUint8Data) {
            res.status(404).json({
                errors: [
                    "not found in cloudinary"
                ]
            })
            return
        }
        console.log("Found on cloudinary now loading the data")
        let doc = Automerge.load(cloudinaryUint8Data)
        console.log('Message from file:')
        console.log({ doc })
        //const docHandle = serverRepo.create<EditorType>(doc)
        let docHandle = serverRepo.import(cloudinaryUint8Data)
        console.log("id after updating")
        console.log(docHandle.documentId)
        docHandle.request()
        await docHandle.whenReady()
        console.log("test1")
        console.log(docHandle.isReady())
        console.log("test2")
        console.log("After ready")
        //       DocumentManager.getInstance().addDocumentToUser(documentId, userIdInt, documentIdIntyes)
        res.status(200).json({
            documentId: docHandle.documentId
        })
        return
    } else {
        res.status(200).json({
            documentId: documentId
        })
        return
    }
}


export {
    editDocHandler
}
