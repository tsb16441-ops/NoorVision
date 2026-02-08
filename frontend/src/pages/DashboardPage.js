import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Plus, Star, ShieldCheck, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { 
  Navbar, 
  DreamCard, 
  LoadingSpinner,
  DisclaimerBanner 
} from '../components/NoorVisionComponents';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dreams, setDreams] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dreamsRes, patternsRes] = await Promise.all([
        axios.get(`${API_URL}/api/dreams/history?limit=6`),
        axios.get(`${API_URL}/api/dreams/patterns/analysis`)
      ]);
      setDreams(dreamsRes.data);
      setPatterns(patternsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const categoryStats = patterns?.category_breakdown || { "ru'ya": 0, "hulm": 0, "ambiguous": 0 };

  return (
    <div className="min-h-screen bg-[#FAFAF8]" data-testid="dashboard-page">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-gray-500 text-sm mb-1">Assalamu Alaikum,</p>
            <h1 className="font-serif text-3xl text-gray-800" data-testid="dashboard-welcome">
              {user?.name}
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Dreams</p>
              <p className="text-2xl font-serif text-gray-800">{patterns?.total_dreams || 0}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Star className="w-3 h-3" /> Ru'ya
              </p>
              <p className="text-2xl font-serif text-emerald-600">{categoryStats["ru'ya"]}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Hulm
              </p>
              <p className="text-2xl font-serif text-red-600">{categoryStats["hulm"]}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ambiguous
              </p>
              <p className="text-2xl font-serif text-gray-600">{categoryStats["ambiguous"]}</p>
            </div>
          </div>

          {/* New Dream CTA */}
          <div className="mb-10">
            <Link to="/dream/new">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 text-sm px-5 py-2 rounded-md">
                <Plus className="w-4 h-4 mr-2" />
                New Dream
              </Button>
            </Link>
          </div>

          {/* Recent Dreams */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-gray-800">Recent Dreams</h2>
              {dreams.length > 0 && (
                <Link to="/patterns" className="text-sm text-[#0E7490] hover:underline">
                  View all
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : dreams.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dreams.map((dream) => (
                  <DreamCard 
                    key={dream.id} 
                    dream={dream} 
                    onClick={() => navigate(`/dream/${dream.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Insights */}
          {patterns?.insights && patterns.insights.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-10">
              <h3 className="font-medium text-gray-800 mb-4">Insights</h3>
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

          <DisclaimerBanner compact />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
