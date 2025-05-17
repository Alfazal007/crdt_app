import * as Automerge from '@automerge/automerge'
import fs from 'fs'

const binary = fs.readFileSync('./automerge-repo-data/Ne/jqbXoVK4KqG7n1F3ZbcZUfAMt/snapshot/9a6e465d3a52ec94baef991e525f87e2c43987a046e90d4213a5f72cb66c884b')

const doc = Automerge.load(binary)

// @ts-ignore
const latestText = doc.data.toString() // or doc.data.join('')
console.log(latestText) // itachi shanks kaidou

