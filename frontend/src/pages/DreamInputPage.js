import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Send } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { 
  Navbar, 
  DisclaimerBanner,
  LoadingSpinner 
} from '../components/NoorVisionComponents';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DreamInputPage = () => {
  const navigate = useNavigate();
  const [dreamContent, setDreamContent] = useState('');
  const [trackPatterns, setTrackPatterns] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dreamContent.trim() || dreamContent.trim().length < 10) {
      toast.error('Please describe your dream in more detail');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/dreams/interpret`, {
        content: dreamContent.trim(),
        track_patterns: trackPatterns
      });
      
      toast.success('Dream interpreted');
      navigate(`/dream/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to interpret dream');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]" data-testid="dream-input-page">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Moon className="w-6 h-6 text-[#CA8A04] mx-auto mb-4" />
            <h1 className="font-serif text-3xl text-[#0E7490] mb-2" data-testid="dream-input-title">
              Share Your Dream
            </h1>
            <p className="text-gray-500 text-sm">
              Describe your dream and receive an interpretation based on Islamic sources
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mb-8">
            <DisclaimerBanner />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="dream-form">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <label className="text-sm text-gray-700 font-medium mb-3 block">Your Dream</label>
              <textarea
                value={dreamContent}
                onChange={(e) => setDreamContent(e.target.value)}
                placeholder="I found myself in a vast garden with flowing water..."
                className="w-full h-48 border border-gray-200 rounded-lg p-4 text-gray-700 placeholder:text-gray-400 focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] resize-none dream-textarea"
                data-testid="dream-textarea"
              />
              <p className="text-xs text-gray-400 mt-2">{dreamContent.length} characters</p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="trackPatterns"
                checked={trackPatterns}
                onCheckedChange={setTrackPatterns}
                className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#0E7490] data-[state=checked]:border-[#0E7490]"
                data-testid="track-patterns-checkbox"
              />
              <div>
                <Label htmlFor="trackPatterns" className="text-sm text-gray-700 cursor-pointer">
                  Enable Pattern Tracking
                </Label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Store this dream to analyze recurring symbols over time
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || dreamContent.trim().length < 10}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 py-3 text-sm disabled:opacity-50"
              data-testid="submit-dream-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Interpreting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Get Interpretation
                </span>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DreamInputPage;
