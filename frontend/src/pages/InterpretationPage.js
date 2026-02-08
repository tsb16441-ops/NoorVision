import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Moon, ArrowLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { 
  Navbar, 
  CategoryBadge,
  SymbolCard,
  SourceCitation,
  GuidanceSection,
  DisclaimerBanner,
  LoadingSpinner 
} from '../components/NoorVisionComponents';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const InterpretationPage = () => {
  const { dreamId } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDream();
  }, [dreamId]);

  const fetchDream = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dreams/${dreamId}`);
      setDream(response.data);
    } catch (error) {
      toast.error('Failed to load interpretation');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/dreams/${dreamId}`);
      toast.success('Dream deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!dream) return null;

  const guidance = dream.guidance || {};

  return (
    <div className="min-h-screen bg-[#FAFAF8]" data-testid="interpretation-page">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm" data-testid="back-to-dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-gray-400 hover:text-red-500" data-testid="delete-dream-btn">
                  <Trash2 className="w-4 h-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Dream?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-6">
            <CategoryBadge category={dream.category} />
            <span className="text-sm text-gray-400">{formatDate(dream.created_at)}</span>
          </div>

          {/* Disclaimer */}
          <div className="mb-8">
            <DisclaimerBanner />
          </div>

          {/* Dream */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8" data-testid="dream-content-section">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Your Dream</h2>
            <p className="text-gray-700 leading-relaxed dream-textarea">
              {dream.dream_content}
            </p>
          </div>

          {/* Pattern Context */}
          {dream.pattern_context && (
            <div className="disclaimer rounded-lg p-4 mb-8" data-testid="pattern-context">
              <p className="text-sm text-gray-600">{dream.pattern_context}</p>
            </div>
          )}

          {/* Interpretation */}
          <div className="mb-8" data-testid="interpretation-section">
            <h2 className="font-serif text-2xl text-[#0E7490] mb-4">Your Interpretation</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                {dream.interpretation}
              </p>
            </div>
          </div>

          {/* Symbols */}
          {dream.symbols && dream.symbols.length > 0 && (
            <div className="mb-8" data-testid="symbols-section">
              <h3 className="font-medium text-gray-800 mb-4">Key Symbols</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dream.symbols.map((symbol, index) => (
                  <SymbolCard
                    key={index}
                    symbol={symbol.symbol}
                    meaning={symbol.meaning}
                    source={symbol.source}
                    confidence={symbol.confidence}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Guidance */}
          {guidance && Object.keys(guidance).length > 0 && (
            <div className="mb-8" data-testid="guidance-section">
              <h3 className="font-medium text-gray-800 mb-4">Guidance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guidance.immediate_actions?.length > 0 && (
                  <GuidanceSection title="Immediate Actions" items={guidance.immediate_actions} variant="immediate" />
                )}
                {guidance.reflective_advice?.length > 0 && (
                  <GuidanceSection title="Reflective Advice" items={guidance.reflective_advice} variant="reflective" />
                )}
                {guidance.preventive_tips?.length > 0 && (
                  <GuidanceSection title="Preventive Tips" items={guidance.preventive_tips} variant="preventive" />
                )}
              </div>
            </div>
          )}

          {/* Sources */}
          {dream.sources && dream.sources.length > 0 && (
            <div className="mb-8" data-testid="sources-section">
              <h3 className="font-medium text-gray-800 mb-4">Sources</h3>
              <div className="space-y-3">
                {dream.sources.map((source, index) => (
                  <SourceCitation key={index} text={source.text} reference={source.reference} />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-10">
            <Link to="/dream/new" className="flex-1">
              <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 py-3" data-testid="new-dream-btn">
                New Dream
              </Button>
            </Link>
            <Link to="/patterns" className="flex-1">
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 py-3" data-testid="view-patterns-btn">
                View Patterns
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterpretationPage;
