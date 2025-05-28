import { DocHandle, isValidAutomergeUrl, Repo, type DocumentId } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useContext, useEffect, useState } from 'react';
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Editor } from './editor';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/context/UserContext';

export type EditorType = {
    paragraphs: string[]
}

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

    let rootDocUrl = document.location.hash.substring(1)

    useEffect(() => {
        if (!clicked || !repo) {
            return
        }

        (async () => {
            let curHandle: DocHandle<EditorType> | null = null
            //           if (isValidAutomergeUrl(rootDocUrl)) {
            console.log({ rootDocUrl })
            curHandle = await repo.find(rootDocUrl)
            console.log("requesting")
            console.log({ curHandle })
            curHandle.request()
            console.log("readtingh")
            await curHandle.whenReady()
            setHandle(curHandle)
            //         } else {
            // toast("Invalid url")
            //       }
            console.log({ curHandle })
        })()
    }, [clicked, repo])

    useEffect(() => {
        if (handle) {
            document.location.hash = handle.url
            rootDocUrl = handle.url
        }
    }, [handle, clicked])

    if (!clicked || !repo) {
        return (
            <>
                <Button onClick={() => { setClicked(true) }}> Click to load the document</Button>
            </>
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
