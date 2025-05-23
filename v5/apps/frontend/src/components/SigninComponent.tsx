import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { signInTypes } from "@repo/zodtypes"
import { Link } from "react-router-dom"

type SignInFormData = z.infer<typeof signInTypes>

export default function SigninPage() {
    const [formData, setFormData] = useState<SignInFormData>({
        username: "",
        password: "",
    })
    const [errors, setErrors] = useState<Partial<Record<keyof SignInFormData, string>>>({})
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (errors[name as keyof SignInFormData]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        try {
            const validatedData = signInTypes.parse(formData);
            console.log("Sign up data:", validatedData);
            // TODO:: Make a axios request
            alert("Account created successfully!");
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Partial<Record<keyof SignInFormData, string>> = {};
                error.errors.forEach((err) => {
                    const fieldName = err.path[0] as keyof SignInFormData;
                    if (typeof fieldName === "string") {
                        fieldErrors[fieldName] = err.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                console.error("Unexpected error:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
                    <CardDescription className="text-center">Login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={errors.username ? "border-red-500" : ""}
                                    required
                                />
                                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={errors.password ? "border-red-500" : ""}
                                    required
                                />
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>
                            <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
                                {isLoading ? "Creating account..." : "Create account"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
