"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LockKeyhole, User } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // In a real app, you would validate credentials against a backend
    // For demo purposes, we'll just simulate a login
    setTimeout(() => {
      // Store user info in localStorage or use a proper auth solution
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "Admin User",
          username: formData.username,
        }),
      )
      router.push("/dashboard")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="w-full border-secondary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-secondary to-primary text-white rounded-t-lg">
        <CardTitle>Admin Login</CardTitle>
        <CardDescription className="text-white/80">Enter your credentials to access the dashboard</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
                className="pl-10 border-secondary/20"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10 border-secondary/20"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-navy font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
