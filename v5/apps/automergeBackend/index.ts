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
    const { token, userId } = req.body
    if (!token || !userId) {
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
            id: dochandle.documentId as string,
            creatorId: userIdInt
        }
    }))
    DocumentManager.getInstance().addDocumentToUser(dochandle.documentId.toString(), userIdInt)
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
    res.status(201).json({
        documentId: dochandle.documentId,
    })
    return
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

    wsServer.handleUpgrade(request, socket, head, (socket) => {
        WebSocketManager.getInstance().addSocket(socket, token, parseInt(userId))
        DocumentManager.getInstance().addUser(parseInt(userId))
        socket.on("close", () => {
            WebSocketManager.getInstance().removeSocket(socket)
            DocumentManager.getInstance().removeUser(parseInt(userId))
        })
        console.log("upgrading socket connection")
        wsServer.emit("connection", socket, request)
    })
})

serverRepo.on("document", (d) => {
    console.log({ d })
})
