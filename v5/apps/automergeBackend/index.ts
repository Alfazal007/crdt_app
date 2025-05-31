import express from "express"
import { WebSocketServer } from "ws"
import { Repo } from "@automerge/automerge-repo"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"
import { RedisManager } from "./helpers/redis"
import { WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { WebSocketManager } from "./managers/WebSocketManager"
import { DocumentManager } from "./managers/DocumentManager"
import cors from "cors"
import { configDotenv } from "dotenv"
import { createDocHandler } from "./createDocuementHandler"
import { editDocHandler } from "./editDocumentHandler"

configDotenv()

export type EditorType = {
    paragraphs: string[]
}

const wsServer = new WebSocketServer({ noServer: true })
const config = {
    network: [],
    storage: new NodeFSStorageAdapter(),
}

const PORT = 8001
export const serverRepo = new Repo({
    ...config, sharePolicy: async () => {
        return true
    }
})

// @ts-ignore
const serverAdaptor = new WebSocketServerAdapter(wsServer)
serverRepo.networkSubsystem.addNetworkAdapter(serverAdaptor)

export const app = express()

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}))

app.use(express.json())
app.post("/createDocument", createDocHandler)
app.post("/editDocument", editDocHandler)

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
        ws.on("close", async () => {
            WebSocketManager.getInstance().removeSocket(ws)
            await DocumentManager.getInstance().removeUser(parseInt(userId))
        })
        ws.on("error", async () => {
            console.log("socket errored out")
            WebSocketManager.getInstance().removeSocket(ws)
            await DocumentManager.getInstance().removeUser(parseInt(userId))
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

