import { dataToBeSavedToDatabase } from "../extractDataAutomerge"
import { CloudinaryManager } from "../managers/CloudinaryManager";

async function saveToDatabase(documentId: string) {
    const bytesOfDocument = dataToBeSavedToDatabase(documentId)
    const base64Document = uint8ArrayToBase64(bytesOfDocument)
    let success = false
    while (!success) {
        success = await CloudinaryManager.getInstance().sendRawData(`data/${documentId}`, base64Document)
    }
    console.log(`saved doc to the database ${documentId}`)
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

export {
    saveToDatabase
}
