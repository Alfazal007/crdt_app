import { v2 as cloudinary } from "cloudinary"
import { tryCatch } from "../helpers/tryCatch"

class CloudinaryManager {
    static instance: CloudinaryManager
    private constructor() { }

    static getInstance(): CloudinaryManager {
        if (!this.instance) {
            this.instance = new CloudinaryManager()
            cloudinary.config({
                api_key: process.env.CLOUDINARY_API_KEY,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_secret: process.env.CLOUDINARY_API_SECRET
            })
        }
        return this.instance
    }

    async sendRawData(publicId: string, base64data: string): Promise<boolean> {
        const dataUri = `data:application/octet-stream;base64,${base64data}`;
        const response = await tryCatch(cloudinary.uploader.upload(dataUri, {
            public_id: publicId,
            resource_type: "raw",
            invalidate: true
        }))
        if (response.error) {
            return false
        }
        return true
    }

    async resourceExists(publicId: string): Promise<boolean> {
        const resourceExists = await tryCatch(cloudinary.api.resource(publicId, {
            resource_type: "raw"
        }))
        if (resourceExists.error) {
            return false
        }
        if (!resourceExists.data.asset_id) {
            return false
        }
        return true
    }

    async downloadAndConvertToUint8Array(publicId: string): Promise<[Uint8Array | null, boolean]> {
        const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;
        const responseResult = await tryCatch(fetch(url))
        if (responseResult.error) {
            return [null, false]
        }
        if (!responseResult.data) {
            return [null, false]
        }
        const arrayBuffer = await responseResult.data.arrayBuffer();
        return [new Uint8Array(arrayBuffer), true]
    }
}

export {
    CloudinaryManager
}
