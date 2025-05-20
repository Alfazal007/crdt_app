import { updateText, type AutomergeUrl } from "@automerge/automerge-repo"
import { useDocument } from "@automerge/automerge-repo-react-hooks"
import type { EditorType } from "./App"

function Editor({ docUrl }: { docUrl: AutomergeUrl }) {
    const [doc, changeDoc] = useDocument<EditorType>(docUrl)

    if (!doc || !changeDoc) {
        return
    }
    return (
        <>
            <input placeholder="Enter your data here" value={doc.data}
                onChange={(e) =>
                    changeDoc((d) => {
                        updateText(d, ["data"], e.target.value);
                    })
                }
            />
        </>
    )
}

export {
    Editor
}
