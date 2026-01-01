"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { useAuth } from "@/contexts/AuthContext" // No longer used directly here, we use signIn
import { signIn } from "next-auth/react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    // const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (res?.error) {
                toast.error("Login Failed", {
                    description: "Invalid email or password"
                });
            } else {
                toast.success("Welcome back!", {
                    description: "You have been successfully logged in."
                })
                router.push("/guest")
                router.refresh() // Refresh to update session
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/guest" });
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

            <Card className="w-full max-w-md mx-4 relative bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md shadow-lg border border-white/10">
                            <Image
                                src="/LOGO.svg"
                                alt="Logo"
                                width={50}
                                height={50}
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Welcome back</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <Button variant="outline" className="w-full bg-white text-black hover:bg-slate-200 border-0 font-semibold h-12" onClick={handleGoogleLogin} disabled={isLoading}>
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Sign in with Google
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#D1AE6A]" />
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        required
                                        className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-[#D1AE6A]/50 focus:ring-[#D1AE6A]/20"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm font-medium text-[#D1AE6A] hover:text-[#D1AE6A]/80 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#D1AE6A]" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="pl-10 pr-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-[#D1AE6A]/50 focus:ring-[#D1AE6A]/20"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button className="w-full h-12 font-bold bg-[#D1AE6A] hover:bg-[#8D5D11] text-white shadow-lg shadow-[#D1AE6A]/20 mt-2 transition-all duration-300" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center">
                    <div className="text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="font-semibold text-[#D1AE6A] hover:text-[#D1AE6A]/80 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
