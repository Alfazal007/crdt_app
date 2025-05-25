import { UserContext } from "@/context/UserContext"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "./ui/button"
import axios from "axios"

const Dashboard = () => {
    const navigate = useNavigate()
    const userContext = useContext(UserContext)

    useEffect(() => {
        if (!userContext) {
            toast("Relogin")
            navigate("/signin")
            return
        }
        if (!userContext.user.id || !userContext.user.accessToken) {
            toast("Relogin")
            navigate("/signin")
            return
        }
    }, [])

    async function handleCreateDoc() {
        try {
            let token = userContext?.user.accessToken
            let userId = userContext?.user.id
            if (!token || !userId) {
                toast("token and userid not here")
                return
            }
            console.log({
                token,
                userId
            })
            const handleCreateDocResponse = await axios.post(`http://localhost:8001/createDocument`, {
                token,
                userId
            })

            if (handleCreateDocResponse.status != 201) {
                toast("Creation of document failed")
                return
            }
            navigate(`/document#automerge:${handleCreateDocResponse.data.documentId}`)
        } catch (err) {
            toast("Creation of document failed")
            return
        }
    }

    return (
        <>
            <Button onClick={handleCreateDoc}>Create a document</Button>
            <div> This is Dashboard page</div>
        </>
    )
}

export default Dashboard
