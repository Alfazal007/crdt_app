import { dataToBeSavedToDatabase } from "../extractDataAutomerge"
import { CloudinaryManager } from "../managers/CloudinaryManager";

async function saveToDatabase(documentId: string, databaseDocId: number) {
    const bytesOfDocument = dataToBeSavedToDatabase(documentId)
    console.log({ bytesOfDocument })
    let success = false
    while (!success) {
        success = await CloudinaryManager.getInstance().sendRawData(`data/${databaseDocId}`, bytesOfDocument)
    }
    console.log(`saved doc to the database ${documentId}`)
}

export {
    saveToDatabase
}
