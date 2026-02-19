import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { label: "Tentang", href: "about" },
  { label: "Tujuan", href: "objectives" },
  { label: "Detail", href: "details" },
  { label: "Kalender", href: "/calendar", isRoute: true },
  { label: "Donasi", href: "donation" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const dashboardLink = isAdmin ? "/admin/dashboard" : "/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isHomePage && location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    }
  }, [location, isHomePage]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string, isRoute?: boolean) => {
    if (isRoute) return;
    
    e.preventDefault();
    if (!isHomePage) {
      navigate(`/#${href}`);
    } else {
      const element = document.getElementById(href);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navBgClass = !isHomePage || isScrolled 
    ? "bg-card/95 backdrop-blur-md shadow-lg border-b border-border" 
    : "bg-transparent";

  const textClass = !isHomePage || isScrolled 
    ? "text-foreground" 
    : "text-primary-foreground";

  const linkTextClass = !isHomePage || isScrolled 
    ? "text-muted-foreground" 
    : "text-primary-foreground/80";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}
    >
      <div className="container px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className={`font-bold text-xl transition-colors ${textClass}`}>
              <span className="text-accent">#</span>Belajar<wbr />Sambil<wbr />Beramal
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.isRoute ? link.href : `/#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href, link.isRoute)}
                className={`text-sm font-medium transition-colors hover:text-accent ${linkTextClass}`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={dashboardLink} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-gold-dark"
              >
                <Link to="/login">Masuk</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 ${textClass}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 right-0 bg-card shadow-lg border-b border-border"
            >
              <div className="container px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.isRoute ? link.href : `/#${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href, link.isRoute)}
                    className="text-foreground py-2 font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isAuthenticated ? (
                  <>
                    <div className="h-px bg-border my-2" />
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                    <Button asChild variant="secondary" className="w-full justify-start">
                      <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </Button>
                  </>
                ) : (
                  <Button 
                    asChild 
                    className="bg-accent text-accent-foreground hover:bg-gold-dark w-full"
                  >
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Masuk</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;