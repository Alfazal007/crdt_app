import { UserContext } from "@/context/UserContext"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "./ui/button"

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
    }

    return (
        <>
            <Button onClick={handleCreateDoc}>Create a document</Button>
            <div> This is Dashboard page</div>
        </>
    )
}

export default Dashboard
