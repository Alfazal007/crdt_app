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
        this.docsToUser.get(userId)?.push(documentId)
    }

    addUser(userId: number) {
        this.docsToUser.set(userId, [])
    }

    removeUser(userId: number) {
        let docIds = this.docsToUser.get(userId)
        if (!docIds) {
            return
        }
        docIds.forEach((docId) => {
            // TODO:: insert into database the current state
        })
    }
}

