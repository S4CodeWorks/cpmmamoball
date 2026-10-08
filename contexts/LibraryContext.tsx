'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { fetchAnnouncements, fetchAnnouncementReads, persistAnnouncementReads, type Announcement } from '@/lib/announcements';

const STORAGE='cpm_read_announcements';
interface State {items:Announcement[];reads:Set<string>;loading:boolean;error:string|null}
interface Value extends State {refresh:()=>void;markRead:(ids:string[])=>Promise<void>;reading:boolean}
const Ctx=createContext<Value|null>(null);
export function LibraryProvider({children}:{children:ReactNode}){
 const {user,loading:authLoading}=useAuth(),{cookieConsent,showError}=useApp();
 const [state,setState]=useState<State>({items:[],reads:new Set(),loading:true,error:null}),[version,setVersion]=useState(0),[reading,setReading]=useState(false);
 const guestReads=useRef(new Set<string>()),owner=useRef(user?.id??null),busy=useRef(0);useEffect(()=>{owner.current=user?.id??null;},[user?.id]);
 useEffect(()=>{if(cookieConsent==='declined'){guestReads.current.clear();try{localStorage.removeItem(STORAGE);}catch{}}},[cookieConsent]);
 useEffect(()=>{
  if(authLoading)return;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000),uid=user?.id??null;let active=true;
  Promise.resolve().then(()=>{if(active)setState({items:[],reads:new Set(),loading:true,error:null});});
  if(!uid&&cookieConsent==='accepted'){try{const data=JSON.parse(localStorage.getItem(STORAGE)||'[]');if(Array.isArray(data))guestReads.current=new Set(data.filter(x=>typeof x==='string'));}catch{}}
  Promise.all([fetchAnnouncements(false,controller.signal),uid?fetchAnnouncementReads(uid,controller.signal):Promise.resolve([...guestReads.current])]).then(([items,reads])=>{if(active)setState({items,reads:new Set(reads),loading:false,error:null});}).catch(()=>{if(active)setState(s=>({...s,loading:false,error:'Não foi possível carregar'}));}).finally(()=>clearTimeout(timer));
  return()=>{active=false;clearTimeout(timer);controller.abort();};
 },[user?.id,authLoading,cookieConsent,version]);
 const markRead=useCallback(async(ids:string[])=>{
  const allowed=new Set(state.items.map(n=>n.id)),unread=[...new Set(ids)].filter(id=>allowed.has(id)&&!state.reads.has(id));if(!unread.length||state.loading||state.error)return;
  const uid=user?.id??null;busy.current++;setReading(true);
  try{
   if(uid)await persistAnnouncementReads(uid,unread);
   else{unread.forEach(id=>guestReads.current.add(id));if(cookieConsent==='accepted'){try{localStorage.setItem(STORAGE,JSON.stringify([...guestReads.current]));}catch{/* In-memory reading remains available. */}}}
   if(owner.current===uid)setState(s=>({...s,reads:new Set([...s.reads,...unread])}));
  }catch(err){if(owner.current===uid)showError(new Error('Não foi possível salvar a leitura. Tente novamente.'));throw err;}
  finally{busy.current--;if(!busy.current)setReading(false);}
 },[state.items,state.reads,state.loading,state.error,user?.id,cookieConsent,showError]);
 const refresh=useCallback(()=>setVersion(v=>v+1),[]);
 useEffect(()=>{const focus=()=>refresh();window.addEventListener('focus',focus);return()=>window.removeEventListener('focus',focus);},[refresh]);
 return <Ctx.Provider value={{...state,reading,refresh,markRead}}>{children}</Ctx.Provider>;
}
export function useLibrary(){const v=useContext(Ctx);if(!v)throw new Error('LibraryProvider required');return v;}
