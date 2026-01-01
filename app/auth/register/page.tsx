"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { useAuth } from "@/contexts/AuthContext"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
    const router = useRouter()
    // const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    // Password strength logic
    const getPasswordStrength = (password: string) => {
        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        return score
    }

    const passwordStrength = getPasswordStrength(formData.password)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            // Show error
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await res.json()


            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong')
            }

            // Sign in the user immediately after registration to create a session
            await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            router.push("/guest")
            router.refresh()
        } catch (error) {
            console.error(error)
            // Show error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center py-10">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

            <Card className="w-full max-w-md mx-4 relative bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="absolute top-4 left-4">
                    <Link href="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                        <ArrowLeft className="h-6 w-6 relative z-10" />
                    </Link>
                </div>
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
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Create an account</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                        Enter your details to generate your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-[#D1AE6A]" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-[#D1AE6A]/50 focus:ring-[#D1AE6A]/20"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
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
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
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

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= passwordStrength
                                                ? passwordStrength > 2 ? 'bg-[#D1AE6A]' : 'bg-yellow-500'
                                                : 'bg-white/10'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#D1AE6A]" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-[#D1AE6A]/50 focus:ring-[#D1AE6A]/20"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[#D1AE6A] animate-in fade-in" />
                                )}
                            </div>
                        </div>
                        <Button className="w-full h-12 font-bold bg-[#D1AE6A] hover:bg-[#8D5D11] text-white shadow-lg shadow-[#D1AE6A]/20 mt-4 transition-all duration-300" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center">
                    <div className="text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-semibold text-[#D1AE6A] hover:text-[#D1AE6A]/80 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
