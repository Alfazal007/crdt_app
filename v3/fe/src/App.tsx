import { DocHandle, isValidAutomergeUrl, Repo } from '@automerge/automerge-repo';
import './App.css'
import { Editor } from './Editor'
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useEffect, useState } from 'react';
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"

export type EditorType = {
    paragraphs: string[]
}

function App() {
    const [handle, setHandle] = useState<DocHandle<EditorType>>()
    const network = new BrowserWebSocketClientAdapter("ws://localhost:3000");
    const repo = new Repo({
        network: [network],
    })

    let rootDocUrl = document.location.hash.substring(1)

    useEffect(() => {
        let handle: DocHandle<EditorType>;
        if (isValidAutomergeUrl(rootDocUrl)) {
            handle = repo.find(rootDocUrl)
        } else {
            handle = repo.create<EditorType>({
                paragraphs: [""]
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
                Your content is:
                {
                    handle &&
                    <Editor docUrl={handle.url} />
                }
            </RepoContext.Provider>
        </>
    )
}

export default App
