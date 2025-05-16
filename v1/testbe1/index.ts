import { WebSocketServer } from "ws"
import { BrowserWebSocketClientAdapter, NodeWSServerAdapter, WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { Repo } from "@automerge/automerge-repo"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"

const config1 = {
    network: [],
    storage: new NodeFSStorageAdapter(),
}

const wsServer = new WebSocketServer({ port: 3000 })
const serverAdaptor = new WebSocketServerAdapter(wsServer)

const serverRepo = new Repo(config1)
serverRepo.networkSubsystem.addNetworkAdapter(serverAdaptor)

setTimeout(() => {
    console.log("Connecting other server")
    const peerAdapter = new BrowserWebSocketClientAdapter(`ws://localhost:3001`)
    serverRepo.networkSubsystem.addNetworkAdapter(peerAdapter)
}, 10000)

serverRepo.on("document", (d) => {
    console.log("New document")
    console.log({ d })
})

