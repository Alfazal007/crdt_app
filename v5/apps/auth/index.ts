import { app } from "./app"
import { configDotenv } from "dotenv"
configDotenv()

const PORT = 8000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

