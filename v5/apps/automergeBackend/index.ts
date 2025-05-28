import express from "express"
import { WebSocketServer } from "ws"
import { Repo } from "@automerge/automerge-repo"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"
import { RedisManager } from "./helpers/redis"
import { WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { tryCatch } from "./tryCatch"
import { prisma } from "@repo/database"
import { WebSocketManager } from "./managers/WebSocketManager"
import { DocumentManager } from "./managers/DocumentManager"
import cors from "cors"
import { configDotenv } from "dotenv"
import { CloudinaryManager } from "./managers/CloudinaryManager"
import { Automerge } from "@automerge/automerge-repo/slim"
import { dataToBeSavedToDatabase } from "./extractDataAutomerge"

configDotenv()

type EditorType = {
    paragraphs: string[]
}

const wsServer = new WebSocketServer({ noServer: true })
const config = {
    network: [],
    storage: new NodeFSStorageAdapter(),
}

const PORT = 8001
const serverRepo = new Repo({
    ...config, sharePolicy: async () => {
        return true
    }
})

// @ts-ignore
const serverAdaptor = new WebSocketServerAdapter(wsServer)
serverRepo.networkSubsystem.addNetworkAdapter(serverAdaptor)

serverRepo.on("document", (doc) => {
    doc.handle.on("change", (change) => {
        console.log({ change })
    })
})

const app = express()

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}))

app.use(express.json())

app.post("/createDocument", async (req, res) => {
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
})

app.post("/editDocument", async (req, res) => {
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
    const existsDocument = await tryCatch(serverRepo.find(docIdString))
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
        let doc = Automerge.load(cloudinaryUint8Data)
        console.log('Message from file:')
        doc.paragraphs.forEach((para) => {
            console.log(para.elems.join("") + "\n")
        })
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
})



























const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

server.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url ?? "", `http://${request.headers.host}`)
    const userId = url.searchParams.get("userId")
    const token = url.searchParams.get("token")
    if (!token || !userId) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
        socket.destroy()
        return
    }
    const redisTokenValid = await RedisManager.getInstance().getValue(`auth:${userId}`, token)
    if (!redisTokenValid) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
        socket.destroy()
        return
    }

    wsServer.handleUpgrade(request, socket, head, (ws) => {
        WebSocketManager.getInstance().addSocket(ws, token, parseInt(userId))
        DocumentManager.getInstance().addUser(parseInt(userId))
        ws.on("close", () => {
            WebSocketManager.getInstance().removeSocket(ws)
            DocumentManager.getInstance().removeUser(parseInt(userId))
        })
        ws.on("error", () => {
            console.log("socket errored out")
            WebSocketManager.getInstance().removeSocket(ws)
            DocumentManager.getInstance().removeUser(parseInt(userId))
        })
        console.log("upgrading socket connection")
        wsServer.emit("connection", ws, request)
    })
})

/*
setInterval(async () => {
    console.log('Current documents in repo:', Object.keys(serverRepo.handles))

    Object.entries(serverRepo.handles).map(([docId, handle]) => {
        if (handle) {
            console.log("key id", docId)
            console.log("Document id", handle.documentId)
            console.log("Document ready?", handle.isReady())
            console.log("Document state:", handle.state)
        }
    })
}, 5000)
*/

