import { Link } from 'react-router-dom';
import { Moon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navbar, DisclaimerBanner } from '../components/NoorVisionComponents';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8]" data-testid="landing-page">
      <Navbar />
      
      {/* Hero Section with sky background */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Sky/cloud background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.4,
            height: '70%'
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#FAFAF8]/70 to-[#FAFAF8]" style={{ height: '70%' }} />

        <div className="max-w-3xl mx-auto text-center relative z-10 pt-16">
          {/* Moon icon */}
          <Moon className="w-8 h-8 text-[#CA8A04] mx-auto mb-8" />
          
          <h1 
            className="font-serif text-5xl md:text-6xl text-[#0E7490] mb-6 leading-tight"
            data-testid="hero-title"
          >
            Wisdom in Your Dreams
          </h1>
          
          <p className="text-gray-600 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            AI-guided interpretation rooted in Islamic tradition, hadith, and the classical 
            teachings of scholars like Ibn Sirin
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" data-testid="hero-get-started-btn">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 text-sm rounded-md">
                Begin Your Journey
              </Button>
            </Link>
            <Link to="/login" data-testid="hero-sign-in-btn">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-sm rounded-md"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <DisclaimerBanner />
        </div>
      </section>

      {/* Your Interpretation Section */}
      <section className="py-16 px-6" data-testid="interpretation-preview">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-[#0E7490]">
              Your Interpretation
            </h2>
            <Link to="/dream/new">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 text-sm px-5 py-2 rounded-md">
                New Dream
              </Button>
            </Link>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-gray-500 text-center py-12">
              Sign in to view your dream interpretations and track patterns over time.
            </p>
          </div>
        </div>
      </section>

      {/* Features - minimal */}
      <section className="py-16 px-6 bg-white" data-testid="features-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl text-[#0E7490] text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl text-[#CA8A04] mb-3">01</div>
              <h3 className="font-medium text-gray-800 mb-2">Share Your Dream</h3>
              <p className="text-gray-500 text-sm">Describe your dream in your own words</p>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#CA8A04] mb-3">02</div>
              <h3 className="font-medium text-gray-800 mb-2">AI Analyzes</h3>
              <p className="text-gray-500 text-sm">Classical sources guide the interpretation</p>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#CA8A04] mb-3">03</div>
              <h3 className="font-medium text-gray-800 mb-2">Receive Guidance</h3>
              <p className="text-gray-500 text-sm">Actionable insights with source citations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#CA8A04]" />
            <span className="font-serif text-gray-700">NoorVision</span>
          </div>
          <p className="text-gray-400 text-xs">
            Educational tool only
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
