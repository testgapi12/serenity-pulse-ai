import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/", label: "Mood Tracker", icon: "💚" },
    { path: "/breathing", label: "Breathing", icon: "🧘‍♀️" },
    { path: "/progress", label: "Progress", icon: "📈" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-wellness-gradient rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">SP</span>
              </div>
              <span className="font-bold text-lg text-foreground hidden sm:block">
                Serenity Pulse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <span>{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user.email?.split('@')[0]}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button 
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start flex items-center space-x-3"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
              
              {/* Mobile User Info & Logout */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="w-full justify-start flex items-center space-x-3 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;