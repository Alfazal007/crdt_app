import fs from 'fs'
import * as Automerge from '@automerge/automerge'

function dataToBeSavedToDatabase(documentId: string) {
    const firstDirectory = documentId.substring(0, 2)
    const innerDirectory = documentId.substring(2, documentId.length)
    const snapshotDir = `./automerge-repo-data/${firstDirectory}/${innerDirectory}/snapshot/`
    const changesDir = `./automerge-repo-data/${firstDirectory}/${innerDirectory}/incremental`
    const snapshotFiles = fs.readdirSync(snapshotDir)
    if (snapshotFiles.length !== 1) {
        throw new Error(`Expected exactly one snapshot file, found ${snapshotFiles.length}`)
    }
    const snapshotPath = `${snapshotDir}/${snapshotFiles[0]}`
    const snapshot = new Uint8Array(fs.readFileSync(snapshotPath))
    const changeFiles = fs.readdirSync(changesDir).sort()
    const changes = changeFiles.map(file =>
        new Uint8Array(fs.readFileSync(`${changesDir}/${file}`))
    )
    let snapShotdoc = Automerge.load(snapshot)
    const [doc,] = Automerge.applyChanges(snapShotdoc, changes)
    const toBeSavedToDatabase = Automerge.save(doc)
    return toBeSavedToDatabase
}

export {
    dataToBeSavedToDatabase
}

