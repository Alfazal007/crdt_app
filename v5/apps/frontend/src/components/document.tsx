import { DocHandle, isValidAutomergeUrl, Repo } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useContext, useEffect, useState } from 'react';
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Editor } from './editor';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/context/UserContext';
import axios from 'axios';

export type EditorType = {
    paragraphs: string[]
}

function Document() {
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
            let curHandle: DocHandle<EditorType> | null = null;
            if (isValidAutomergeUrl(rootDocUrl)) {
                curHandle = await repo.find(rootDocUrl)
                setHandle(curHandle)
            } else {
                toast("Invalid url")
            }
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
                <Button onClick={async () => {
                    const responseFetchRepo = await axios.post(`http://localhost:8001/editDocument`, {
                        token: userContext?.user.accessToken,
                        userId: userContext?.user.id,
                        documentId: 1
                    })
                    console.log({ responseFetchRepo })
                    navigate(`/edit-document#automerge:${responseFetchRepo.data.documentId}`)
                }}> Edit document</Button>
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

export default Document
