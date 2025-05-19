import express from "express"
import { WebSocketServer } from "ws"
import { BrowserWebSocketClientAdapter, NodeWSServerAdapter, WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { Repo } from "@automerge/automerge-repo"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"
import axios from "axios"
import cors from "cors"

const wsServer = new WebSocketServer({ noServer: true })
const config = {
    network: [],
    storage: new NodeFSStorageAdapter(),
}

const PORT = 3001
const peerToDocMap: Map<string, Set<string>> = new Map()
const serverAdaptor = new WebSocketServerAdapter(wsServer)

const serverRepo = new Repo({
    ...config, sharePolicy: async (peerId, documentId) => {
        if (!peerId || !documentId) {
            return false
        }
        if (!peerToDocMap.has(peerId)) {
            return false
        }
        // @ts-ignore
        if (!peerToDocMap.get(peerId).has(documentId)) {
            return false
        }
        return true
    }
})

serverRepo.networkSubsystem.addNetworkAdapter(serverAdaptor)

setTimeout(() => {
    const peerAdapter = new BrowserWebSocketClientAdapter(`ws://localhost:3000`)
    serverRepo.networkSubsystem.addNetworkAdapter(peerAdapter)
}, 30000)

const app = express()
app.use(express.static("public"))
app.use(express.json())
app.use(cors())

app.post("/something", async (req, res) => {
    try {
        const { documentId, peerId, type } = req.body;
        if (type == "server") {
            if (!peerToDocMap.has(peerId)) {
                peerToDocMap.set(peerId, new Set())
            }
            if (!peerToDocMap.get(peerId)?.has(documentId)) {
                peerToDocMap.get(peerId)?.add(documentId)
            }
        } else {
            await axios.post("http://localhost:3000/something", {
                documentId: documentId,
                peerId: serverRepo.networkSubsystem.peerId,
                type: "server"
            })
        }
        res.send("Sent mate")
    } catch (err) {
        console.log(err)
        res.send("That did not work")
    }
})

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit("connection", socket, request)
    })
})
