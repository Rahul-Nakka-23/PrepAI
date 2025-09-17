
import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import LoginPage from './components/pages/LoginPage';
import SetupPage from './components/pages/SetupPage';
import InterviewPage from './components/pages/InterviewPage';
import ResultsPage from './components/pages/ResultsPage';
import DashboardPage from './components/pages/DashboardPage';
import Header from './components/Header';

const App: React.FC = () => {
  const { page } = useContext(AppContext);

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage />;
      case 'setup':
        return <SetupPage />;
      case 'interview':
        return <InterviewPage />;
      case 'results':
        return <ResultsPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <div className="min-h-screen bg-primary font-sans">
      {page !== 'login' && <Header />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
