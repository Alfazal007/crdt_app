import fs from 'fs'
import * as Automerge from '@automerge/automerge'
import path from 'path'

function dataToBeSavedToDatabase(documentId: string) {
    console.log({ documentId })
    const firstDirectory = documentId.substring(0, 2)
    const innerDirectory = documentId.substring(2)
    const snapshotDir = path.join('./automerge-repo-data', firstDirectory, innerDirectory, 'snapshot')
    const changesDir = path.join('./automerge-repo-data', firstDirectory, innerDirectory, 'incremental')

    const snapshotFiles = fs.readdirSync(snapshotDir)
    if (snapshotFiles.length !== 1) {
        throw new Error(`Expected exactly one snapshot file, found ${snapshotFiles.length}`)
    }

    const snapshotPath = path.join(snapshotDir, snapshotFiles[0])
    const snapshot = new Uint8Array(fs.readFileSync(snapshotPath))

    let snapShotdoc = Automerge.load(snapshot)
    let doc = snapShotdoc

    if (fs.existsSync(changesDir)) {
        const changeFiles = fs.readdirSync(changesDir).sort()
        const changes = changeFiles.map(file =>
            new Uint8Array(fs.readFileSync(path.join(changesDir, file)))
        )
        const [updatedDoc] = Automerge.applyChanges(snapShotdoc, changes)
        doc = updatedDoc
    }

    const toBeSavedToDatabase = Automerge.save(doc)
    return toBeSavedToDatabase
}

export {
    dataToBeSavedToDatabase
}


