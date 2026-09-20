import { Activity, Bell, CheckCircle2, FolderKanban, ShieldCheck, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

const features = [
  { icon: ShieldCheck, title: 'Role-based access', description: 'Focused workspaces for administrators, project managers, and developers.' },
  { icon: FolderKanban, title: 'Projects and tasks', description: 'Coordinate clients, delivery work, priorities, ownership, and due dates.' },
  { icon: Activity, title: 'Live activity', description: 'See task progress as it happens with a persistent real-time activity feed.' },
  { icon: Bell, title: 'Smart notifications', description: 'Keep the right people informed about assignment and review milestones.' },
  { icon: Users, title: 'Team collaboration', description: 'Give every team member a clear, secure view of the work that matters.' },
  { icon: CheckCircle2, title: 'Delivery clarity', description: 'Use status, priority, and due-date context to keep client work moving.' }
];

export const HomePage = (): React.JSX.Element => {
  const { user, initialized } = useAppSelector((state) => state.auth);
  if (!initialized) return <div className="loading-screen">Restoring session…</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <main className="home-page">
    <nav className="home-nav">
      <div className="flex items-center gap-3"><div className="home-logo">A</div><div><p className="font-semibold text-slate-900">Agency OS</p><p className="text-xs text-slate-400">Client delivery</p></div></div>
      <Link className="secondary-button" to="/login">Login</Link>
    </nav>
    <section className="home-hero"><p className="eyebrow">Real-time project delivery</p><h1>Keep client work moving, together.</h1><p className="home-lede">Agency OS is a secure real-time project management dashboard for clients, projects, tasks, team activity, and notifications.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link className="primary-button home-cta" to="/login">Login to your workspace</Link></div><div className="home-preview" aria-label="Dashboard preview"><div className="home-preview-bar"><span></span><span></span><span></span><p>Live delivery overview</p></div><div className="home-preview-content"><div className="home-preview-stats"><div><p>Active projects</p><strong>12</strong></div><div><p>In review</p><strong>08</strong></div><div><p>Team online</p><strong>06</strong></div></div><div className="home-preview-feed"><p className="font-medium text-slate-700">Recent activity</p><div><i></i><span>Task moved to In Review</span><small>now</small></div><div><i></i><span>New task assigned</span><small>2m</small></div><div><i></i><span>Client project updated</span><small>8m</small></div></div></div></div></section>
    <section className="home-features"><div className="home-section-heading"><p className="eyebrow">One connected workspace</p><h2>Everything your delivery team needs</h2><p>Built around accountable ownership, clear visibility, and immediate updates.</p></div><div className="home-feature-grid">{features.map(({ icon: Icon, title, description }) => <article className="home-feature" key={title}><div className="home-feature-icon"><Icon size={20}/></div><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <footer className="home-footer"><div><span className="home-logo">A</span><span>Agency OS</span></div><p>Real-time visibility for exceptional client delivery.</p></footer>
  </main>;
};
