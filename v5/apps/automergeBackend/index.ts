import express from "express"
import { WebSocketServer } from "ws"
import { Repo } from "@automerge/automerge-repo"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"
import { RedisManager } from "./helpers/redis"
import { WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket"

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
        console.log("upgrading socket connection")
        wsServer.emit("connection", socket, request)
    })
})

serverRepo.on("document", (d) => {
    console.log({ d })
})
