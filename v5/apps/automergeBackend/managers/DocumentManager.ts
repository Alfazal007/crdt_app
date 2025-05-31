import type { DocumentId } from "automerge-repo";
import { serverRepo } from "..";
import { saveToDatabase } from "../helpers/databaseSaver"

export class DocumentManager {
    private static instance: DocumentManager | null = null
    private docsToUser: Map<number, string[]>
    private docsToDocId: Map<string, number> // the docid in the handle pointing to the database docid
    private trackers: Map<string, number>;

    private constructor() {
        this.docsToUser = new Map()
        this.docsToDocId = new Map()
        this.trackers = new Map()
    }

    static getInstance(): DocumentManager {
        if (!DocumentManager.instance) {
            DocumentManager.instance = new DocumentManager()
        }
        return DocumentManager.instance
    }

    addDocumentToUser(documentId: string, userId: number, databaseDocId: number) {
        this.docsToDocId.set(documentId, databaseDocId)
        if (!this.docsToUser.get(userId)) {
            this.docsToUser.set(userId, [])
        }
        this.docsToUser.get(userId)?.push(documentId)
        let prev = this.trackers.get(documentId) || 0
        this.trackers.set(documentId, 1 + prev)
        console.log("added document")
        console.log(this.docsToUser)
    }

    addUser(userId: number) {
        if (!this.docsToUser.get(userId)) {
            this.docsToUser.set(userId, [])
        }
        console.log("added user")
    }

    async removeUser(userId: number) {
        console.log("remove user called")
        let docIds = this.docsToUser.get(userId)
        if (!docIds) return
        for (const docId of docIds) {
            await saveToDatabase(docId, this.docsToDocId.get(docId) || -1)
            let prev = this.trackers.get(docId) || 0
            let next = prev - 1
            if (next < 1) {
                this.trackers.delete(docId)
                this.docsToDocId.delete(docId)
                console.log("removing tracking of document from the server")
                console.log({ docIdBeingDeleted: docId })
                serverRepo.delete(docId as DocumentId)
            } else {
                this.trackers.set(docId, next)
            }
        }
        this.docsToUser.delete(userId)
        console.log({ trackers: this.trackers })
        console.log({ docsToUsers: this.docsToUser })
        console.log({ docsToDocId: this.docsToDocId })
    }

    getDocId(docIdNum: number): string {
        for (const key of this.docsToDocId.keys()) {
            if (this.docsToDocId.get(key) == docIdNum) {
                return key
            }
        }
        return ""
    }
}

