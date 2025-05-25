import fs from 'fs'
import * as Automerge from '@automerge/automerge'

const snapshotPath = './automerge-repo-data/4V/rxkG9hFbuivQmQGCb4cszp4D3y/snapshot/98ccb4641890d19da08115676cf9de1958022b667cf38772b274852b511ae426'

const changesDir = './automerge-repo-data/4V/rxkG9hFbuivQmQGCb4cszp4D3y/incremental'

const snapshot = new Uint8Array(fs.readFileSync(snapshotPath))

const changeFiles = fs.readdirSync(changesDir).sort()
const changes = changeFiles.map(file =>
    new Uint8Array(fs.readFileSync(`${changesDir}/${file}`))
)

let doc = Automerge.load(snapshot)

doc = Automerge.applyChanges(doc, changes)

const finalState = JSON.parse(JSON.stringify(doc))

console.log(JSON.stringify(finalState, null, 2))

