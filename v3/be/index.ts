import express from "express"
import { WebSocketServer } from "ws"
import { WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"
import { Repo } from "@automerge/automerge-repo"
import { next as Automerge } from "@automerge/automerge";

const wsServer = new WebSocketServer({ noServer: true })
const config = {
    network: [],
    storage: new NodeFSStorageAdapter(),
}

const PORT = 3000
const serverRepo = new Repo(config)

// @ts-ignore
const serverAdaptor = new WebSocketServerAdapter(wsServer)
serverRepo.networkSubsystem.addNetworkAdapter(serverAdaptor)

const app = express()

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit("connection", socket, request)
    })
})

/*
let doc = Automerge.from({ text: "hello world" });

doc = Automerge.change(doc, d => {
    Automerge.mark(d, ["text"], { start: 0, end: 5, expand: "both" }, "bold", true);
});

let doc = Automerge.from({
  paragraphs: [
    { text: new Automerge.Text("Hello world") },
    { text: new Automerge.Text("This is another paragraph") }
  ]
});

doc = Automerge.change(doc, d => {
  Automerge.mark(d, ["paragraphs", 1, "text"], { start: 0, end: 4, expand: "both" }, "bold", true);
});
*/
