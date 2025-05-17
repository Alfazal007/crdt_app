import { WebSocketServer } from "ws"
import { BrowserWebSocketClientAdapter, NodeWSServerAdapter, WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { Repo, type DocumentId, type PeerId } from "@automerge/automerge-repo"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"

const config1 = {
    network: [],
    storage: new NodeFSStorageAdapter()
}

const wsServer = new WebSocketServer({ port: 3000 })
const serverAdaptor = new WebSocketServerAdapter(wsServer)

const defaultSharePolicy = async (peerId: PeerId, documentId?: DocumentId): Promise<boolean> => {
    console.log(`SharePolicy: DEFAULT DENYING document ${documentId || 'unknown'} for peer ${peerId}`);
    return false;
};

const serverRepo = new Repo({ ...config1, sharePolicy: async () => false })
serverRepo.networkSubsystem.addNetworkAdapter(serverAdaptor)

/*
setTimeout(() => {
    console.log("Connecting other server")
    const peerAdapter = new BrowserWebSocketClientAdapter(`ws://localhost:3001`)
    serverRepo.networkSubsystem.addNetworkAdapter(peerAdapter)
}, 30000)
*/

