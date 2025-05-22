import { DocHandle, isValidAutomergeUrl, Repo } from '@automerge/automerge-repo';
import './App.css'
import { Editor } from './Editor'
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useEffect, useState } from 'react';
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"

export type EditorType = {
    data: string
}

function App() {
    const [handle, setHandle] = useState<DocHandle<EditorType>>()
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNvbWVvbmUxIiwiaWQiOjEsImlhdCI6MTc0Nzk0MjI0MCwiZXhwIjoxNzQ4MDI4NjQwfQ.A3akIWUsqaq4YvArtuEgVr2_Wft2OfxHuTs85zp4crE";
    const userId = 1;
    const network = new BrowserWebSocketClientAdapter(`ws://localhost:8001/?token=${encodeURIComponent(token)}&userId=${userId}`);

    const repo = new Repo({
        network: [network],
    })

    let rootDocUrl = document.location.hash.substring(1)

    useEffect(() => {
        let curHandle;
        if (isValidAutomergeUrl(rootDocUrl)) {
            curHandle = repo.find(rootDocUrl)
        } else {
            curHandle = repo.create<EditorType>({
                data: ""
            })
        }
        console.log({ handle })
        setHandle(handle)
    }, [])

    useEffect(() => {
        if (handle) {
            document.location.hash = handle.url
            rootDocUrl = handle.url
        }
    }, [handle])

    return (
        <>
            <RepoContext.Provider value={repo}>
                {
                    handle &&
                    <Editor docUrl={handle.url} />
                }
            </RepoContext.Provider>
        </>
    )
}

export default App
