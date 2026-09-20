import { LogOut, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearSession } from '../features/auth/authSlice';
import { authApi } from '../services/api';
import { NotificationMenu } from './NotificationMenu';
export const Navbar = (): React.JSX.Element => { const [dark, setDark] = useState(false); const user = useAppSelector((state) => state.auth.user); const dispatch = useAppDispatch(); const navigate = useNavigate(); const toggle = (): void => { document.documentElement.classList.toggle('dark'); setDark((value) => !value); }; const logout = async (): Promise<void> => { await authApi.logout().catch(() => undefined); dispatch(clearSession()); navigate('/login'); }; return <header className="navbar"><div><p className="text-sm text-slate-400">Internal agency workspace</p><p className="font-semibold text-slate-800">{user?.name}</p></div><div className="flex items-center gap-2"><button className="icon-button" aria-label="Toggle theme" onClick={toggle}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><NotificationMenu/><button className="icon-button" aria-label="Log out" onClick={() => void logout()}><LogOut size={18}/></button></div></header>; };
