import { createClient } from "redis";
import { tryCatch } from "../tryCatch";

class RedisManager {
    private static instance: RedisManager | null = null
    private client

    private constructor() {
        this.client = createClient()
        this.client.on('error', (err) => {
            console.log('Redis Client Error', err)
            process.exit(1)
        })
    }

    static getInstance() {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager()
        }
        return RedisManager.instance
    }

    async getValue(key: string, token: string): Promise<boolean> {
        if (!this.client) {
            return false
        }
        if (!this.client.isOpen) {
            await this.client.connect()
        }
        const redisResult = await tryCatch(this.client.get(key))
        if (redisResult.error) {
            return false
        }
        if (redisResult.data != token) {
            return false
        }
        return true
    }
}

export {
    RedisManager
}
