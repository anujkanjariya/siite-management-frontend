import { useState, useEffect } from 'react'
import { Calculator, Loader2, LogOut, User as UserIcon } from 'lucide-react'
import { Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom'
import SiteList from './components/sites/SiteList'
import BillingTable from './components/tables/BillingTable'
import * as api from './api/api'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import './App.css'

// Separate component for Site Details to use useParams
const SiteDetailView = ({ sites, onRenameSite, onRefreshSites }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const activeSite = sites.find(s => s.id === id);

  useEffect(() => {
    // If sites are loaded but activeSite isn't found, navigate back.
    if (sites.length > 0 && !activeSite) {
      navigate('/');
    }
  }, [activeSite, sites, navigate]);

  return (
    <BillingTable
      siteId={id}
      siteName={activeSite?.name}
      onBack={() => navigate('/')}
      onRenameSite={onRenameSite}
      onRefreshSites={onRefreshSites}
    />
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const fetchSites = async () => {
    try {
      const { data } = await api.getSites();
      const mappedSites = data.map(s => ({ ...s, id: s._id }));
      setSites(mappedSites);
    } catch (err) {
      console.error('Error fetching sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const addSite = async (name) => {
    try {
      await api.createSite(name);
      fetchSites();
    } catch (err) {
      console.error('Error adding site:', err);
    }
  };

  const deleteSite = async (id) => {
    try {
      await api.deleteSite(id);
      fetchSites();
    } catch (err) {
      console.error('Error deleting site:', err);
    }
  };

  const renameSite = async (id, newName) => {
    try {
      await api.updateSite(id, { name: newName });
      fetchSites();
    } catch (err) {
      console.error('Error renaming site:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">BillingMaster</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                Signed in as {user?.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all font-bold text-sm group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <Routes>
          <Route path="/" element={
            <SiteList
              sites={sites}
              onAddSite={addSite}
              onSelectSite={(id) => navigate(`/site/${id}`)}
              onDeleteSite={deleteSite}
              onRenameSite={renameSite}
            />
          } />
          <Route path="/site/:id" element={<SiteDetailView sites={sites} onRenameSite={renameSite} onRefreshSites={fetchSites} />} />
        </Routes>

        <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} BillingMaster Dashboard. Securely logged in as {user?.name}.</p>
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <LogOut size={32} />
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Confirm Logout</h3>
            <p className="text-slate-500 text-center font-medium mb-8">
              Are you sure you want to log out? You will need to sign in again to access your projects.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-red-100 active:scale-[0.98]"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black transition-all active:scale-[0.98]"
              >
                No, Keep me in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !user ? (
            <Login onRegisterClick={() => navigate('/register')} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/register"
        element={
          !user ? (
            <Register onLoginClick={() => navigate('/login')} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/*"
        element={
          user ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
