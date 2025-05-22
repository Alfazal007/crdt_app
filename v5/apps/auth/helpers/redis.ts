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

    async setKeyValue(key: string, value: string): Promise<boolean> {
        if (!this.client) {
            return false
        }
        if (!this.client.isOpen) {
            await this.client.connect()
        }
        const redisResult = await tryCatch(this.client.set(key, value))
        if (redisResult.error) {
            return false
        }
        return true
    }
}

export {
    RedisManager
}
