import { DocHandle, isValidAutomergeUrl, Repo, type DocumentId } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useContext, useEffect, useState } from 'react';
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Editor } from './editor';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/context/UserContext';
import type { EditorType } from './document';
import axios from 'axios';

function EditDocument() {
    const navigate = useNavigate()
    const userContext = useContext(UserContext)
    const [clicked, setClicked] = useState(false)
    const [repo, setRepo] = useState<Repo>()
    const [handle, setHandle] = useState<DocHandle<EditorType>>()

    useEffect(() => {
        if (!userContext) {
            toast("Relogin")
            navigate("/signin")
            return
        }
        if (!userContext.user.id || !userContext.user.accessToken) {
            toast("Relogin")
            navigate("/signin")
            return
        }
        const network = new BrowserWebSocketClientAdapter(`ws://localhost:8001/?token=${encodeURIComponent(userContext.user.accessToken)}&userId=${userContext.user.id}`);
        const repo = new Repo({
            network: [network],
        })
        setRepo(repo)

        network.onClose = () => {
            console.log("closing network")
        }

        return () => {
            if (repo) {
                console.log("network disconnecting")
                const ws = network.socket
                if (ws && ws.readyState === WebSocket.OPEN) {
                    console.log('Closing WebSocket manually');
                    ws.close();
                }
                repo.networkSubsystem.disconnect();
            }
        }
    }, [])

    useEffect(() => {
        if (!clicked || !repo) {
            return
        }
        (async () => {
            try {
                const responseGetData = await axios.post(`http://localhost:8001/editDocument`, {
                    token: userContext?.user.accessToken,
                    userId: userContext?.user.id,
                    documentId: "3uiPGQdWoJzUHiRDqKRR7kJahCdp"
                })
                console.log({ responseGetData })
                let curHandle: DocHandle<EditorType> | null = null;
                console.log("is valid")
                if (isValidAutomergeUrl("automerge:3uiPGQdWoJzUHiRDqKRR7kJahCdp")) {
                    console.log("finding")
                    curHandle = await repo.find("automerge:3uiPGQdWoJzUHiRDqKRR7kJahCdp" as DocumentId)
                    console.log("fouund")
                    console.log({ curHandle })
                    await curHandle.whenReady()
                    console.log("ready")
                    setHandle(curHandle)
                } else {
                    toast("Invalid url")
                }
                console.log({ curHandle })
            } catch (err) {
                console.log({ err })
            }
        })()
    }, [clicked, repo])

    let rootDocUrl
    useEffect(() => {
        console.log("use effect")
        console.log({ handle })
        if (handle) {
            console.log("handle found")
            document.location.hash = handle.url
            rootDocUrl = handle.url
            document.location.hash = handle.url
            console.log({ url: handle.url })
        }
    }, [handle, clicked])

    if (!clicked || !repo) {
        return (
            <Button onClick={() => { setClicked(true) }}> Click to load the document</Button>
        )
    } else {
        return (
            <>
                <RepoContext.Provider value={repo}>
                    Your content is:
                    {
                        handle &&
                        <Editor docUrl={handle.url} />
                    }
                </RepoContext.Provider>
            </>
        )
    }
}

export default EditDocument
