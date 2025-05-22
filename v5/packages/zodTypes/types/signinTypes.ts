import { z } from "zod"

const signInTypes = z.object({
    username: z.string({ message: "username not provided" })
        .min(3, { message: "Minimum length of username should be 3" })
        .max(20, { message: "Maximum length of username should be 20" }),
    password: z.string({ message: "password not provided" })
        .min(6, { message: "Minimum length of password should be 6" })
        .max(20, { message: "Maximum length of password should be 20" }),
})

export {
    signInTypes
}
