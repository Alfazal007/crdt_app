import express from "express"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}))

import { authRouter } from "./routes"
app.use("/api/v1/auth", authRouter)

export {
    app
}
