import { useRef } from "react"
import { saveToDatabase } from "../helpers/databaseSaver"

export class DocumentManager {
    private static instance: DocumentManager | null = null
    private docsToUser: Map<number, string[]>
    private constructor() {
        this.docsToUser = new Map()
    }

    static getInstance(): DocumentManager {
        if (!DocumentManager.instance) {
            DocumentManager.instance = new DocumentManager()
        }
        return DocumentManager.instance
    }

    addDocumentToUser(documentId: string, userId: number) {
        if (!this.docsToUser.get(userId)) {
            this.docsToUser.set(userId, [])
        }
        this.docsToUser.get(userId)?.push(documentId)
        console.log("addewd document")
        console.log(this.docsToUser)
    }

    addUser(userId: number) {
        if (!this.docsToUser.get(userId)) {
            this.docsToUser.set(userId, [])
        }
        console.log("addewd user")
        console.log(this.docsToUser)
    }

    removeUser(userId: number) {
        let docIds = this.docsToUser.get(userId)
        if (!docIds) {
            return
        }
        docIds.forEach(async (docId) => {
            await saveToDatabase(docId)
        })
        this.docsToUser.delete(userId)
    }
}

