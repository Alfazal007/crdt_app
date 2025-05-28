import { UserContext } from "@/context/UserContext"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "./ui/button"
import axios from "axios"

const Dashboard = () => {
    const navigate = useNavigate()
    const userContext = useContext(UserContext)
    const [docName, setDocName] = useState("")

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
                userId,
                docName
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
            <input value={docName} onChange={(e) => {
                setDocName(e.target.value)
            }}
                placeholder="Enter the document name"
            />
            <Button onClick={handleCreateDoc}>Create a document</Button>
            <div> This is Dashboard page</div>
            <Button onClick={async () => {
                console.log("clicked")
                try {
                    const responseFetchRepo = await axios.post(`http://localhost:8001/editDocument`, {
                        token: userContext?.user.accessToken,
                        userId: userContext?.user.id,
                        documentId: "21XM6TNX1AkUwNxaTFy7NS2czZgG"
                    })
                    console.log({ responseFetchRepo })
                    navigate(`/edit-document#automerge=${responseFetchRepo.data.documentId}`)
                } catch (err) {
                    console.log({ err })
                }
            }}> Edit document</Button>
        </>
    )
}

export default Dashboard
