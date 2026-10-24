"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {Check,AlertTriangle,Undo2,X} from 'lucide-react';
import {Login} from '@/components/auth/Login';
import {Sidebar,Header} from '@/components/layout/ShellNavigation';
import {Dashboard} from '@/components/dashboard/Dashboard';
import {Orders} from '@/components/orders/Orders';
import {Kanban} from '@/components/kanban/Kanban';
import {api,ApiError} from '@/lib/api';
import type {Activity,Order,Ops,Status,Toast,View} from '@/lib/types';

const routeFor: Record<View,string>={dashboard:'/dashboard',orders:'/pedidos',kanban:'/kanban'};
export default function OmniMarketApp(){
 const router=useRouter(); const pathname=usePathname();
 const [hydrated,setHydrated]=useState(false);
 const [logged,setLogged]=useState(false);
 const [theme,setTheme]=useState('light');
 const [collapsed,setCollapsed]=useState(false),[mobile,setMobile]=useState(false);
 const [orders,setOrders]=useState<Order[]>([]);
 const [activity,setActivity]=useState<Activity[]>([]);
 const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
 const busy=useRef(0);
 const [toasts,setToasts]=useState<Toast[]>([]);
 const view:View=pathname==='/pedidos'?'orders':pathname==='/kanban'?'kanban':'dashboard';
 useEffect(()=>{
   setLogged(localStorage.getItem('omni-session')==='1');
   setTheme(localStorage.getItem('omni-theme')||'light');
   setHydrated(true);
 },[]);
 useEffect(()=>{if(hydrated){document.documentElement.dataset.theme=theme;localStorage.setItem('omni-theme',theme)}},[theme,hydrated]);
 useEffect(()=>{if(!hydrated)return;if(logged&&pathname==='/')router.replace('/dashboard');if(!logged&&pathname!=='/')router.replace('/')},[hydrated,logged,pathname,router]);
 const notify=(t:Omit<Toast,'id'>)=>{const id=Date.now();setToasts(x=>[...x,{...t,id}]);setTimeout(()=>setToasts(x=>x.filter(v=>v.id!==id)),5000)};
 const refresh=useCallback(async()=>{
   if(busy.current>0)return;
   try{const [o,a]=await Promise.all([api.list(),api.audit()]);if(busy.current>0)return;setOrders(o);setActivity(a);setLoadError('')}
   catch(e){setLoadError(e instanceof ApiError?e.message:'Error al cargar los datos.')}
   finally{setLoading(false)}
 },[]);
 useEffect(()=>{
   if(!hydrated||!logged)return;
   refresh();
   const t=setInterval(()=>{if(document.visibilityState==='visible')refresh()},5000);
   return()=>clearInterval(t);
 },[hydrated,logged,refresh]);
 const run=async<T,>(fn:()=>Promise<T>):Promise<T|undefined>=>{
   busy.current++;
   try{return await fn()}
   catch(e){notify({kind:'error',text:e instanceof ApiError?e.message:'No se pudo completar la operación.'});return undefined}
   finally{busy.current--;api.audit().then(setActivity).catch(()=>{})}
 };
 const ops:Ops={
   save:async(o)=>{
     const exists=orders.some(v=>v.id===o.id);
     const r=await run(()=>exists?api.update(o):api.create(o));
     if(!r)return false;
     setOrders(x=>exists?x.map(v=>v.id===r.id?r:v):[r,...x]);
     notify({kind:'success',text:exists?'Pedido actualizado.':`Pedido ${r.id} creado correctamente.`});
     return true;
   },
   remove:async(ids)=>{
     const prev=orders;
     setOrders(x=>x.filter(o=>!ids.includes(o.id)));
     const r=await run(()=>api.batchDelete(ids));
     if(!r){setOrders(prev);return}
     notify({kind:'success',text:'Pedido(s) eliminado(s).'});
   },
   setStatus:async(id,s,opts)=>{
     const old=orders.find(o=>o.id===id)?.status;
     if(!old||old===s)return;
     setOrders(x=>x.map(o=>o.id===id?{...o,status:s}:o));
     const r=await run(()=>api.setStatus(id,s));
     if(!r){setOrders(x=>x.map(o=>o.id===id?{...o,status:old}:o));return}
     notify({kind:'success',text:opts?.text??`${id} actualizado a “${s}”.`,undo:opts?.undo?()=>{void ops.setStatus(id,old,{text:`${id} regresó a “${old}”.`})}:undefined});
   },
   batchStatus:async(ids,s)=>{
     const prev=orders;
     setOrders(x=>x.map(o=>ids.includes(o.id)?{...o,status:s}:o));
     const r=await run(()=>api.batchStatus(ids,s));
     if(!r){setOrders(prev);return}
     notify({kind:'success',text:`Pedidos actualizados a “${s}”.`});
   },
 };
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
 {view==='dashboard'?<Dashboard orders={orders} activity={activity} loading={loading} error={loadError} onRefresh={refresh} setView={setView}/>:view==='orders'?<Orders orders={orders} ops={ops} loading={loading} error={loadError}/>:<Kanban orders={orders} ops={ops} loading={loading}/>}
 </div><div className="toast-stack">{toasts.map(t=><div className={`toast ${t.kind}`} key={t.id}>{t.kind==='success'?<Check/>:<AlertTriangle/>}<span>{t.text}</span>{t.undo&&<button onClick={()=>{t.undo?.();setToasts(x=>x.filter(v=>v.id!==t.id))}}><Undo2/>Deshacer</button>}<button onClick={()=>setToasts(x=>x.filter(v=>v.id!==t.id))}><X/></button></div>)}</div></div>;
}
