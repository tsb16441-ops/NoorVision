import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, ArrowLeft, Star, ShieldCheck, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { 
  Navbar, 
  DreamCard,
  LoadingSpinner,
  DisclaimerBanner 
} from '../components/NoorVisionComponents';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PatternsPage = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patternsRes, dreamsRes] = await Promise.all([
        axios.get(`${API_URL}/api/dreams/patterns/analysis`),
        axios.get(`${API_URL}/api/dreams/history?limit=50`)
      ]);
      setPatterns(patternsRes.data);
      setDreams(dreamsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const categoryBreakdown = patterns?.category_breakdown || { "ru'ya": 0, "hulm": 0, "ambiguous": 0 };
  const totalDreams = patterns?.total_dreams || 0;

  const getPercent = (count) => totalDreams === 0 ? 0 : Math.round((count / totalDreams) * 100);

  return (
    <div className="min-h-screen bg-[#FAFAF8]" data-testid="patterns-page">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600" data-testid="back-btn">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl text-gray-800" data-testid="patterns-title">
                Pattern Analysis
              </h1>
              <p className="text-gray-500 text-sm">Insights from your dreams</p>
            </div>
          </div>

          {totalDreams === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Moon className="w-8 h-8 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No dreams recorded yet</p>
              <Link to="/dream/new">
                <Button className="bg-gray-900 text-white hover:bg-gray-800 text-sm">
                  Record Your First Dream
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-testid="stats-overview">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-2xl font-serif text-gray-800">{totalDreams}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Ru'ya</p>
                  <p className="text-2xl font-serif text-emerald-600">
                    {categoryBreakdown["ru'ya"]}
                    <span className="text-sm text-gray-400 ml-1">({getPercent(categoryBreakdown["ru'ya"])}%)</span>
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Hulm</p>
                  <p className="text-2xl font-serif text-red-600">
                    {categoryBreakdown["hulm"]}
                    <span className="text-sm text-gray-400 ml-1">({getPercent(categoryBreakdown["hulm"])}%)</span>
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Ambiguous</p>
                  <p className="text-2xl font-serif text-gray-600">
                    {categoryBreakdown["ambiguous"]}
                    <span className="text-sm text-gray-400 ml-1">({getPercent(categoryBreakdown["ambiguous"])}%)</span>
                  </p>
                </div>
              </div>

              {/* Distribution Bar */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-10" data-testid="category-distribution">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Distribution</h3>
                <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
                  <div className="bg-emerald-500" style={{ width: `${getPercent(categoryBreakdown["ru'ya"])}%` }} />
                  <div className="bg-red-500" style={{ width: `${getPercent(categoryBreakdown["hulm"])}%` }} />
                  <div className="bg-gray-400" style={{ width: `${getPercent(categoryBreakdown["ambiguous"])}%` }} />
                </div>
                <div className="flex gap-6 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Ru'ya</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Hulm</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Ambiguous</span>
                </div>
              </div>

              {/* Recurring Symbols */}
              {patterns?.recurring_symbols?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-10" data-testid="recurring-symbols">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Recurring Symbols</h3>
                  <div className="flex flex-wrap gap-2">
                    {patterns.recurring_symbols.map((symbol, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gray-100 rounded text-sm text-gray-700">
                        {symbol.symbol} <span className="text-gray-400">({symbol.count}x)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {patterns?.insights?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-10" data-testid="insights">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Insights</h3>
                  <ul className="space-y-2">
                    {patterns.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-[#0E7490]">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* All Dreams */}
              <div data-testid="all-dreams">
                <h3 className="font-medium text-gray-800 mb-4">All Dreams</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dreams.map((dream) => (
                    <DreamCard 
                      key={dream.id} 
                      dream={dream} 
                      onClick={() => navigate(`/dream/${dream.id}`)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <DisclaimerBanner compact />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatternsPage;
