import axios from 'axios';
export const api = axios.create({baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout:15000});
api.interceptors.request.use(config=>{const token=localStorage.getItem('atlas_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,err=>{if(err.response?.status===401 && localStorage.getItem('atlas_token')){localStorage.removeItem('atlas_token');localStorage.removeItem('atlas_user');window.dispatchEvent(new Event('atlas:logout'));}return Promise.reject(err);});
export const unwrap = r => r.data?.data ?? r.data;
export const errorMessage = e => e.response?.data?.error?.message || e.response?.data?.message || e.message || 'No fue posible completar la operación.';
export const endpoints={categories:'/categories',locations:'/locations',zones:'/zones',activities:'/activities',photoSpots:'/photo-spots',reviews:'/reviews'};
