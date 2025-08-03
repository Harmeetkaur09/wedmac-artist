import { Header } from "@/pages/header"
import { Footer } from "@/pages/footer"
import { AuthPage } from "@/pages/AuthPage"

export default function AuthPageRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AuthPage />
      </main>
      <Footer />
    </div>
  )
}
