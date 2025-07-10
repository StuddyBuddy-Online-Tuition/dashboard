import LoginForm from "@/components/login/login-form"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-24 w-24 relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RPBHhgmAbisCI5Y9Lg6k9Rb3r9DtKr.png"
              alt="StudyBuddy Tutors Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-navy">StudyBuddy</h1>
          <p className="mt-2 text-muted-foreground">Student Management Dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
