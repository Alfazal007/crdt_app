import type { WebSocket } from "ws"

export class WebSocketManager {
    private static instance: WebSocketManager | null = null
    private websockets: { socket: WebSocket, token: string, userId: number }[]
    private constructor() {
        this.websockets = []
    }

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager()
        }
        return WebSocketManager.instance
    }

    addSocket(ws: WebSocket, token: string, userId: number) {
        this.websockets.push({
            socket: ws,
            token,
            userId
        })
    }

    removeSocket(ws: WebSocket) {
        this.websockets = this.websockets.filter(socketData => socketData.socket != ws)
    }
}

