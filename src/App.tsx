import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthForm from './components/Auth/AuthForm';
import LandingPage from './components/Landing/LandingPage';
import Header from './components/Layout/Header';
import DocumentList from './components/Documents/DocumentList';
import DocumentViewer from './components/Documents/DocumentViewer';
import ProfileModal from './components/Profile/ProfileModal';

function App() {
  const { user, loading } = useAuth();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (user) {
      setShowLanding(false);
      setShowAuth(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DocuFlow...</p>
        </div>
      </div>
    );
  }

  if (!user && showLanding) {
    return (
      <LandingPage 
        onGetStarted={() => {
          setShowLanding(false);
          setShowAuth(true);
        }} 
      />
    );
  }

  if (!user && showAuth) {
    return (
      <AuthForm 
        onSuccess={() => {
          setShowAuth(false);
        }} 
      />
    );
  }

  if (!user) {
    return (
      <LandingPage 
        onGetStarted={() => {
          setShowLanding(false);
          setShowAuth(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header 
        user={user} 
        onProfileClick={() => setShowProfile(true)}
      />
      <main>
        {selectedDocumentId ? (
          <DocumentViewer
            documentId={selectedDocumentId}
            onBack={() => setSelectedDocumentId(null)}
          />
        ) : (
          <DocumentList onSelectDocument={setSelectedDocumentId} />
        )}
      </main>
      
      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;