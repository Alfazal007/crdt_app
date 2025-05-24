import { User } from "lucide-react";
import React, { createContext, useState, type Dispatch, type SetStateAction } from "react"

export interface User {
    id: string;
    accessToken: string;
}

type UserContextType = {
    user: User;
    setUser: Dispatch<SetStateAction<User>>;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>({ id: "", accessToken: "" });
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider;
