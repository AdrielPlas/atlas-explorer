import React from 'react';
import {Routes,Route,Navigate} from 'react-router-dom';
import {AuthProvider,useAuth} from './Auth';
import Layout from './components/Layout';
import {Home,Login,Explore,CityExplore,LocationDetail,Checklist,Categories,Activities,PhotoSpots,Reviews,Zones} from './pages';
function Guard({children}){const {user,ready}=useAuth();if(!ready)return <div className="loading-state">Preparando tu aventura…</div>;return user?children:<Navigate to="/login" replace/>}
function AppRoutes(){return <Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Login register/>}/><Route element={<Guard><Layout/></Guard>}><Route path="/city" element={<CityExplore/>}/><Route path="/explore" element={<Navigate to="/city" replace/>}/><Route path="/map" element={<Explore/>}/><Route path="/location/:id" element={<LocationDetail/>}/><Route path="/checklist" element={<Checklist/>}/><Route path="/categories" element={<Categories/>}/><Route path="/activities" element={<Activities/>}/><Route path="/photo-spots" element={<PhotoSpots/>}/><Route path="/reviews" element={<Reviews/>}/><Route path="/zones" element={<Zones/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
export default function App(){return <AuthProvider><AppRoutes/></AuthProvider>}
