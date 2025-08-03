import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="bg-[#FF577F] text-white text-center py-2 text-sm">
        Get $20 Off Your First Purchase – Shop Now & Save!
      </div>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Wedmac India
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-700 hover:text-[#FF577F]">
            Home
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-[#FF577F]">
            About Us
          </Link>
          <Link href="/portfolio" className="text-gray-700 hover:text-[#FF577F]">
            Portfolio
          </Link>
          <Link href="/artists" className="text-gray-700 hover:text-[#FF577F]">
            Wedmac Makeup Artist
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-[#FF577F]">
            Contact
          </Link>
          <Link href="/faq" className="text-gray-700 hover:text-[#FF577F]">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="text-[#FF577F] border-[#FF577F] hover:bg-[#FF577F] hover:text-white bg-transparent"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#FF577F] hover:bg-[#E6447A] text-white">Signup</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
