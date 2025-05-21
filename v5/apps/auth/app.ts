import express from "express"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors())

import { authRouter } from "./routes"
app.use("/api/v1/auth", authRouter)

export {
    app
}
