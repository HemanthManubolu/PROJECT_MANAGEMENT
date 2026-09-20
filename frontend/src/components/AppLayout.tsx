import { Outlet } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useRealtime } from '../hooks/useRealtime';
export const AppLayout = (): React.JSX.Element => { const [online, setOnline] = useState(0); const handlePresence = useCallback((count: number) => setOnline(count), []); useRealtime(handlePresence); return <div className="app-shell"><Sidebar/><main className="min-w-0 flex-1"><Navbar/><div className="page"><Outlet context={{ online }}/></div></main></div>; };
