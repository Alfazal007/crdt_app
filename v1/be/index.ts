import { WebSocketServer } from "ws"
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { Repo } from "@automerge/automerge-repo"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"

const wsServer = new WebSocketServer({ port: 3000 })
const config = {
    network: [new NodeWSServerAdapter(wsServer)],
    storage: new NodeFSStorageAdapter(),
}

const serverRepo = new Repo(config)

serverRepo.on("document", (d) => {
    console.log("New document")
    console.log({ d })
})
