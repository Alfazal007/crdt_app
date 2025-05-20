import { type AutomergeUrl } from "@automerge/automerge-repo"
import { useDocument } from "@automerge/automerge-repo-react-hooks"
import type { EditorType } from "./App"
import { useState } from "react"

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

            /*
            Automerge.mark(d, ["paragraphs", 0], {
                expand: 'both',
                start: 0,
                end: 4,
            }, "bold", true)
            const marks = Automerge.marks(d, ["paragraphs", 0])
            console.log(d.paragraphs[0])
            console.log(marks);
            */

        })
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
        </div>
    )
}

export { Editor }
