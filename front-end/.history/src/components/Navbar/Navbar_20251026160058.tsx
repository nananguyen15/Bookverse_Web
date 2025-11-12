import { IoMdNotifications, IoMdSearch } from "react-icons/io";

export function Navbar() {
  const links: [string, string][] = [
    ["Books", "#"],
    ["Series", "#"],
    ["Category", "#"],
    ["About Us", "#"],
    ["Q&A", "#"],
  ];
  return (
    <nav className="flex flex-row items-center justify-between w-full px-10 py-3 bg-beige-50">
      {/* Brand text */}
      <h1 className="font-bold brand-text mr-7">
        <a href="#">BookVerse</a>
      </h1>

      {/* Navigation links */}
      <div className="flex-1">
        <ul className="flex flex-row gap-5">
          {links.map(([title, url]) => (
            <li key={title}>
              <a
                href={url}
                className="inline-block text-gray-800 transition-colors group hover:text-beige-900 font-heading"
              >
                <span className="relative z-10">{title}</span>
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beige-300 mt-1" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Right section: Search + Notifications + Cart + Auth*/}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search books..."
            className="w-64 px-2 py-1 transition-all border-b-2 border-transparent outline-none focus:border-beige-500 hover:border-beige-200"
          />
          <button className="search-btn" aria-label="Search">
            <IoMdSearch />
          </button>
          <a href="#">
            <IoMdNotifications />
          </a>
          <div className="flex gap-2">
            <button className="px-3 py-1 transition-colors border rounded-md background-transparent Customizing your theme
Use the --font-* theme variables to customize the font family utilities in your project:

@theme {
  --font-display: "Oswald", sans-serif; 
}
Now the font-display utility can be used in your markup:

<div class="font-display">
  <!-- ... -->
</div>
You can also provide default font-feature-settings and font-variation-settings values for a font family:

@theme {
  --font-display: "Oswald", sans-serif;
  --font-display--font-feature-settings: "cv02", "cv03", "cv04", "cv11"; 
  --font-display--font-variation-settings: "opsz" 32; 
}
If needed, use the @font-face at-rule to load custom fonts:

@font-face {
  font-family: Oswald;
  font-style: normal;
  font-weight: 200 700;
  font-display: swap;
  src: url("/fonts/Oswald.woff2") format("woff2");
}
If you're loading a font from a service like Google Fonts, make sure to put the @import at the very top of your CSS file:

@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
@import "tailwindcss";
@theme {
  --font-roboto: "Roboto", sans-serif; 
}
Browsers require that @import statements come before any other rules, so URL imports need to be above imports like @import "tailwindcss" which are inlined in the compiled CSS.

Learn more about customizing your theme in the theme documentation.">
              <a href="#">Login</a>
            </button>
            <button className="px-3 py-1 transition-colors border rounded-md background-transparent border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white">
              <a href="#">Sign Up</a>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
