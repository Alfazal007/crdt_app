import { type AutomergeUrl } from "@automerge/automerge-repo"
import { useDocument } from "@automerge/automerge-repo-react-hooks"
import { useState } from "react"
import { next as Automerge } from "@automerge/automerge"
import type { EditorType } from "./document"

function Editor({ docUrl }: { docUrl: AutomergeUrl }) {
    const [doc, changeDoc] = useDocument<EditorType>(docUrl)
    const [localValue, setLocalValue] = useState("")

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const lastChar = value.slice(-1);
        console.log({ lastChar })
        setLocalValue("");
        changeDoc(d => {
            if (lastChar == "\n") {
                d.paragraphs.push("")
            } else {
                d.paragraphs[d.paragraphs.length - 1] += lastChar
            }
            d.paragraphs.forEach((para) => {
                console.log(para)
            })
        })
    }

    function addMark() {
        changeDoc(d => {
            // IMP:: Here end index out of bound will throw error remember
            Automerge.mark(d, ["paragraphs", d.paragraphs.length - 1], {
                expand: 'both',
                start: 0,
                end: 2,
            }, "bold", true)
        })
    }

    function displayMark() {
        if (doc && doc.paragraphs) {
            for (let i = 0; i < doc.paragraphs.length; i++) {
                const marks = Automerge.marks(doc, ["paragraphs", i])
                console.log(marks);
            }
        }
    }

    if (!doc || !changeDoc) {
        return null
    }

    return (
        <div className="editor-container">
            <div className="current-content">
                <h3>Current Content:</h3>
                <p>{doc.paragraphs.join("\n77777\n")}</p>
            </div>
            <div className="input-area">
                <textarea
                    placeholder="Enter your data here"
                    value={localValue}
                    onChange={handleInputChange}
                />
            </div>

            <button onClick={addMark}>Add mark</button>
            <button onClick={displayMark}>Display mark</button>
        </div >
    )
}

export { Editor }
