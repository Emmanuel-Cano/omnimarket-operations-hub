"use client";
import {useEffect,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {Check,AlertTriangle,Undo2,X} from 'lucide-react';
import {Login} from '@/components/auth/Login';
import {Sidebar,Header} from '@/components/layout/ShellNavigation';
import {Dashboard} from '@/components/dashboard/Dashboard';
import {Orders} from '@/components/orders/Orders';
import {Kanban} from '@/components/kanban/Kanban';
import {seedOrders} from '@/lib/orders';
import type {Order,Toast,View} from '@/lib/types';

const routeFor: Record<View,string>={dashboard:'/dashboard',orders:'/pedidos',kanban:'/kanban'};
export default function OmniMarketApp(){
 const router=useRouter(); const pathname=usePathname();
 const [hydrated,setHydrated]=useState(false);
 const [logged,setLogged]=useState(false);
 const [theme,setTheme]=useState('light');
 const [collapsed,setCollapsed]=useState(false),[mobile,setMobile]=useState(false);
 const [orders,setOrders]=useState<Order[]>(seedOrders);
 const [toasts,setToasts]=useState<Toast[]>([]);
 const view:View=pathname==='/pedidos'?'orders':pathname==='/kanban'?'kanban':'dashboard';
 useEffect(()=>{
   setLogged(localStorage.getItem('omni-session')==='1');
   setTheme(localStorage.getItem('omni-theme')||'light');
   try {const saved=JSON.parse(localStorage.getItem('omni-orders')||'null'); if(Array.isArray(saved))setOrders(saved)}catch{}
   setHydrated(true);
 },[]);
 useEffect(()=>{if(hydrated){document.documentElement.dataset.theme=theme;localStorage.setItem('omni-theme',theme)}},[theme,hydrated]);
 useEffect(()=>{if(hydrated)localStorage.setItem('omni-orders',JSON.stringify(orders))},[orders,hydrated]);
 useEffect(()=>{if(!hydrated)return;if(logged&&pathname==='/')router.replace('/dashboard');if(!logged&&pathname!=='/')router.replace('/')},[hydrated,logged,pathname,router]);
 const notify=(t:Omit<Toast,'id'>)=>{const id=Date.now();setToasts(x=>[...x,{...t,id}]);setTimeout(()=>setToasts(x=>x.filter(v=>v.id!==id)),5000)};
 const login=()=>{localStorage.setItem('omni-session','1');setLogged(true);router.push('/dashboard')};
 const logout=()=>{localStorage.removeItem('omni-session');setLogged(false);router.push('/')};
 const toggleTheme=()=>setTheme(t=>t==='dark'?'light':'dark');
 const setView=(v:View)=>router.push(routeFor[v]);
 // Wait until client storage is loaded to prevent hydration inconsistencies.
 if(!hydrated)return null;
 if(!logged)return <Login onLogin={login} theme={theme} toggleTheme={toggleTheme}/>;
 return <div className={`app-shell ${collapsed?'is-collapsed':''}`}>
 <Sidebar view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} mobile={mobile} close={()=>setMobile(false)}/>
 {mobile&&<div className="scrim" onClick={()=>setMobile(false)}/>}
 <div className="main"><Header view={view} theme={theme} toggleTheme={toggleTheme} onLogout={logout} openMenu={()=>setMobile(true)}/>
 {view==='dashboard'?<Dashboard orders={orders} setView={setView}/>:view==='orders'?<Orders orders={orders} setOrders={setOrders} notify={notify}/>:<Kanban orders={orders} setOrders={setOrders} notify={notify}/>}
 </div><div className="toast-stack">{toasts.map(t=><div className={`toast ${t.kind}`} key={t.id}>{t.kind==='success'?<Check/>:<AlertTriangle/>}<span>{t.text}</span>{t.undo&&<button onClick={()=>{t.undo?.();setToasts(x=>x.filter(v=>v.id!==t.id))}}><Undo2/>Deshacer</button>}<button onClick={()=>setToasts(x=>x.filter(v=>v.id!==t.id))}><X/></button></div>)}</div></div>;
}
