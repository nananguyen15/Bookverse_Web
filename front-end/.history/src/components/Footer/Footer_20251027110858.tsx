import { BsFacebook, BsTwitter, BsInstagram } from "react-icons/bs";

type FooterProps = {
  className?: string;
};

export function Footer({ className = "" }: FooterProps) {
  const quickLinks: [string, string][] = [
    ["Home", "/"],
    ["Books", "/allbooks"],
    ["Series", "/series"],
    ["Categories", "/categories"],
  ];

  const supportLinks: [string, string][] = [
    ["About Us", "/about"],
    ["FAQ", "/faq"],
  ];

  return (
    <footer className="text-white bg-linear-to-b from-beige-500 via-beige-700 to-beige-800">
      <div className="px-16 pt-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div>
            <h3 className="mb-4 text-4xl font-brand">BookVerse</h3>
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
            <h4 className="mb-4 text-lg font-heading">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map(([title, url]) => (
                <li key={title}>
                  <a
                    href={url}
                    className="transition-colors hover:text-beige-200"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-lg font-heading">Support</h4>
            <ul className="space-y-2 text-sm">
              {supportLinks.map(([title, url]) => (
                <li key={title}>
                  <a
                    href={url}
                    className="transition-colors hover:text-beige-200"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-lg font-heading">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>FPTU Can Tho Campus</li>
              <li>Email: info@bookstore.com</li>
              <li>Phone: (123) 456-7890</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 mt-6 text-sm text-center border-t border-white/20">
          © 2025 BookStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
