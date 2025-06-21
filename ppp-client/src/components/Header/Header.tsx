import { Link } from "react-router-dom";
import { MobileSidebar } from "./mobile-sidebar";
import { NavLinks } from "./nav-links";
// import { ThemeToggle } from "@/theme/theme-toggle";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur dark:bg-black dark:text-white supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <span className="hidden font-bold sm:inline-block mx-2">PPP-SLIET</span>
          </Link>
          <nav className="flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="flex md:hidden">
            <Link className="flex items-center space-x-2" to="/">
              <span className="font-bold mx-2">PPP-SLIET</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {/* <ThemeToggle /> */}
            <MobileSidebar />
          </div>
        </div>
      </div>
    </header>
  );
}


export default Header;
