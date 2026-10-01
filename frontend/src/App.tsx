import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import CollabSpace from './pages/CollabSpace';
import CommunityLayout from './components/CommunityLayout';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function Home() {
  return (
    <div className="min-h-screen p-8 max-w-[1200px] mx-auto bg-background text-foreground">
      <header className="mb-10 mt-10">
        <h1 className="font-display text-5xl font-bold tracking-tight text-primary">OneShopAI</h1>
        <p className="text-muted-foreground mt-2 font-body text-xl max-w-xl">
          A Full-Stack assignment implementing the new design system.
        </p>
      </header>

      <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="bg-card text-card-foreground border-border/60 rounded-card p-6 border shadow-elevation-1 transition-all hover:shadow-elevation-2 hover:border-primary/30">
          <h2 className="text-2xl font-semibold mb-3">Job Opportunity</h2>
          <p className="text-muted-foreground mb-6">
            Browse and apply for the latest roles in our improved replica of the Opportunity section.
          </p>
          <Link to="/jobs">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-full font-medium transition-colors shadow-btn-blue hover:shadow-btn-blue-hover">
              View Jobs
            </button>
          </Link>
        </section>

        <section className="bg-card text-card-foreground border-border/60 rounded-card p-6 border shadow-elevation-1 transition-all hover:shadow-elevation-2 hover:border-primary/30">
          <h2 className="text-2xl font-semibold mb-3">Collab Space</h2>
          <p className="text-muted-foreground mb-6">
            Connect with other builders, create collaboration requests, and find your next project.
          </p>
          <Link to="/collab">
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-5 py-2.5 rounded-full font-medium transition-colors">
              Enter Collab Space
            </button>
          </Link>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<CommunityLayout><Jobs /></CommunityLayout>} />
          <Route path="/jobs/:id" element={<CommunityLayout><JobDetails /></CommunityLayout>} />
          <Route path="/collab" element={<CommunityLayout><CollabSpace /></CommunityLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
