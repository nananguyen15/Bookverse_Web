import { BsFacebook, BsTwitter, BsInstagram } from "react-icons/bs";

export function Footer() {
  return (
    <footer className="text-white bg-linear-to-b from-beige-500 via-beige-700 to-beige-800">
      <div className="px-16 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div>
            <h3 className="mb-4 text-2xl font-bold font-heading">BookVerse</h3>
            <p className="mb-4 text-sm leading-relaxed opacity-90">
              Your trusted partner for quality books and series collections.
            </p>
            <div className="flex gap-4">
              <a href="#" className="transition-colors hover:text-beige-200">
                <BsFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors hover:text-beige-200">
                <BsTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors hover:text-beige-200">
                <BsInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="transition-colors hover:text-beige-200">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/books"
                  className="transition-colors hover:text-beige-200"
                >
                  Books
                </a>
              </li>
              <li>
                <a
                  href="/series"
                  className="transition-colors hover:text-beige-200"
                >
                  Series
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className="transition-colors hover:text-beige-200"
                >
                  Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/about"
                  className="transition-colors hover:text-beige-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="transition-colors hover:text-beige-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/feedback"
                  className="transition-colors hover:text-beige-200"
                >
                  Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>FPTU Can Tho Campus</li>
              <li>Email: info@bookstore.com</li>
              <li>Phone: (123) 456-7890</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 text-sm text-center border-t border-white/20">
          © 2024 BookStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
