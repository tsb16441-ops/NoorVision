import { Moon, BookOpen, Star, Scroll, Sparkles, ShieldCheck, History, Menu, X, LogOut, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isLandingPage = location.pathname === '/';

  return (
    <nav 
      data-testid="navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || !isLandingPage
          ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2"
          data-testid="logo-link"
        >
          <Moon className="w-5 h-5 text-[#CA8A04]" />
          <span className="font-serif text-xl text-gray-800">
            NoorVision
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-[#0E7490] text-sm transition-colors"
                data-testid="nav-dashboard"
              >
                Dashboard
              </Link>
              <Link 
                to="/dream/new" 
                className="text-gray-600 hover:text-[#0E7490] text-sm transition-colors"
                data-testid="nav-new-dream"
              >
                New Dream
              </Link>
              <Link 
                to="/patterns" 
                className="text-gray-600 hover:text-[#0E7490] text-sm transition-colors"
                data-testid="nav-patterns"
              >
                Patterns
              </Link>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <span className="text-gray-500 text-sm">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-[#0E7490] text-sm transition-colors"
                data-testid="nav-login"
              >
                Sign In
              </Link>
              <Link to="/register" data-testid="nav-register">
                <Button className="bg-gray-900 text-white hover:bg-gray-800 text-sm px-5 py-2 rounded-md">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 py-4 px-6"
          data-testid="mobile-menu"
        >
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/dream/new" 
                  className="text-gray-700 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  New Dream
                </Link>
                <Link 
                  to="/patterns" 
                  className="text-gray-700 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Patterns
                </Link>
                <button
                  className="text-left text-red-500 py-2 text-sm"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-gray-900 text-white text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const BackgroundPattern = () => null;

export const DisclaimerBanner = ({ compact = false }) => {
  if (compact) {
    return (
      <div 
        className="text-sm text-gray-500 py-4"
        data-testid="disclaimer-banner"
      >
        Educational tool only. Not a substitute for scholarly consultation.
      </div>
    );
  }

  return (
    <div 
      className="disclaimer py-5 px-6"
      data-testid="disclaimer-banner"
    >
      <p className="text-gray-600 text-sm leading-relaxed">
        <span className="font-medium text-gray-800">Important Notice:</span>{' '}
        This AI-powered tool provides interpretations based on patterns in Islamic texts and hadith. 
        It is intended for educational and reflective purposes only and does not replace consultation 
        with knowledgeable Islamic scholars. Dreams are deeply personal, and their meanings may vary 
        based on individual circumstances.
      </p>
    </div>
  );
};

export const CategoryBadge = ({ category }) => {
  const configs = {
    "ru'ya": {
      label: "Ru'ya",
      className: "badge-ruya",
    },
    "hulm": {
      label: "Hulm",
      className: "badge-hulm",
    },
    "ambiguous": {
      label: "Ambiguous",
      className: "badge-ambiguous",
    }
  };

  const config = configs[category] || configs.ambiguous;

  return (
    <span 
      className={`inline-block px-3 py-1 rounded text-xs font-medium ${config.className}`}
      data-testid={`category-badge-${category}`}
    >
      {config.label}
    </span>
  );
};

export const SymbolCard = ({ symbol, meaning, source, confidence }) => {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 bg-white"
      data-testid={`symbol-card-${symbol}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-serif text-lg text-gray-800 capitalize">{symbol}</h4>
        <span className="text-xs text-gray-400 uppercase">{confidence}</span>
      </div>
      <p className="text-gray-600 text-sm mb-3">{meaning}</p>
      <p className="text-xs text-gray-400">Source: {source}</p>
    </div>
  );
};

export const SourceCitation = ({ text, reference }) => {
  return (
    <div 
      className="border-l-2 border-[#CA8A04] pl-4 py-2 bg-amber-50/30"
      data-testid="source-citation"
    >
      <p className="text-gray-700 text-sm italic mb-1">"{text}"</p>
      <p className="text-gray-500 text-xs">{reference}</p>
    </div>
  );
};

export const GuidanceSection = ({ title, items, icon: Icon, variant = 'default' }) => {
  return (
    <div 
      className="bg-gray-50 rounded-lg p-5"
      data-testid={`guidance-${variant}`}
    >
      <h4 className="font-medium text-gray-800 mb-3 text-sm">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-[#0E7490] mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'default' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center" data-testid="loading-spinner">
      <div className={`${sizes[size]} border-2 border-gray-200 border-t-[#0E7490] rounded-full animate-spin`} />
    </div>
  );
};

export const DreamCard = ({ dream, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className="dream-card cursor-pointer bg-white border border-gray-200 rounded-lg p-5"
      data-testid={`dream-card-${dream.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <CategoryBadge category={dream.category} />
        <span className="text-xs text-gray-400">{formatDate(dream.created_at)}</span>
      </div>
      <p className="text-gray-700 text-sm line-clamp-3 mb-3">
        {dream.dream_content}
      </p>
      {dream.symbols && dream.symbols.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dream.symbols.slice(0, 3).map((sym, idx) => (
            <span 
              key={idx}
              className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500"
            >
              {sym.symbol}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
