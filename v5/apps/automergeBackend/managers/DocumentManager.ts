import { saveToDatabase } from "../helpers/databaseSaver"

export class DocumentManager {
    private static instance: DocumentManager | null = null
    private docsToUser: Map<number, string[]>
    private docsToDocId: Map<string, number>
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
        console.log("1")
        this.docsToDocId.set(documentId, databaseDocId)
        console.log("2")
        if (!this.docsToUser.get(userId)) {
            console.log("3")
            this.docsToUser.set(userId, [])
        }
        console.log("4")
        this.docsToUser.get(userId)?.push(documentId)
        console.log("5")
        let prev = this.trackers.get(documentId) || 0
        console.log("6")
        this.trackers.set(documentId, 1 + prev)
        console.log("added document")
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
            await saveToDatabase(docId, this.docsToDocId.get(docId) || -1)
            let prev = this.trackers.get(docId) || 0
            this.trackers.set(docId, prev - 1)
        })
        this.docsToUser.delete(userId)
        for (const key of this.trackers.keys()) {
            if (this.trackers.get(key)) {
                // @ts-ignore
                if (this.trackers.get(key) < 1) {
                    this.trackers.delete(key)
                    this.docsToDocId.delete(key)
                }
            }
        }
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

