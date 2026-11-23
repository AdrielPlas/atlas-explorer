import React,{createContext,useContext,useEffect,useState} from 'react';import {api,unwrap} from './api';
const C=createContext(null);export const useAuth=()=>useContext(C);
export function AuthProvider({children}){const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('atlas_user'))}catch{return null}});const [ready,setReady]=useState(false);
useEffect(()=>{let alive=true;(async()=>{const t=localStorage.getItem('atlas_token');if(t){try{const u=unwrap(await api.get('/auth/me'));if(alive){setUser(u);localStorage.setItem('atlas_user',JSON.stringify(u));}}catch{localStorage.removeItem('atlas_token');localStorage.removeItem('atlas_user');if(alive)setUser(null)}}if(alive)setReady(true)})();const out=()=>{setUser(null)};window.addEventListener('atlas:logout',out);return()=>{alive=false;window.removeEventListener('atlas:logout',out)}},[]);
const login=async(email,password)=>{const d=unwrap(await api.post('/auth/login',{email,password}));localStorage.setItem('atlas_token',d.token);localStorage.setItem('atlas_user',JSON.stringify(d.user));setUser(d.user)};
const register=async(name,email,password)=>{const d=unwrap(await api.post('/auth/register',{name,email,password}));localStorage.setItem('atlas_token',d.token);localStorage.setItem('atlas_user',JSON.stringify(d.user));setUser(d.user)};
const logout=()=>{localStorage.removeItem('atlas_token');localStorage.removeItem('atlas_user');setUser(null)};
return <C.Provider value={{user,ready,login,register,logout}}>{children}</C.Provider>}
