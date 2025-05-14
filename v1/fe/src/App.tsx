import { DocHandle, isValidAutomergeUrl, Repo } from '@automerge/automerge-repo';
import './App.css'
import { Editor } from './Editor'
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useEffect, useState } from 'react';

export type EditorType = {
    data: string
}

function App() {
    const [handle, setHandle] = useState<DocHandle<EditorType>>()
    //   const network = new BrowserWebSocketClientAdapter("ws://localhost:8000");
    const repo = new Repo({
        network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
    })
    let rootDocUrl = document.location.hash.substring(1)

    useEffect(() => {
        let handle: DocHandle<EditorType>;
        if (isValidAutomergeUrl(rootDocUrl)) {
            handle = repo.find(rootDocUrl)
        } else {
            handle = repo.create<EditorType>({
                data: ""
            })
        }
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
