import React,{useEffect,useMemo,useState} from 'react';import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom';import {api,unwrap,errorMessage} from './api';import {useAuth} from './Auth';import CityWorld from './components/CityWorld';import MapView from './components/MapView';import CrudPage from './components/CrudPage';import {Search,MapPin,ArrowUpRight,Compass,LocateFixed,Star,Camera,CheckCircle2,Plus,SlidersHorizontal,Navigation,Map as MapIcon,Clock3,Trash2,Edit3,Lock,Landmark,Trees,Utensils,Hotel,Binoculars,Square,Building2,X,Sparkles} from 'lucide-react';
export function Home(){const nav=useNavigate();return <div className="home-page"><header className="landing-nav"><div className="brand"><span className="brand-mark"><Compass/></span>atlas<span className="brand-light">explorer</span></div><div className="landing-links"><a href="#how">Cómo funciona</a><button className="text-btn" onClick={()=>nav('/login')}>Iniciar sesión</button><button className="primary-btn" onClick={()=>nav('/register')}>Comenzar <ArrowUpRight size={16}/></button></div></header><CityWorld onExplore={()=>nav('/city')}/><section className="landing-bottom" id="how"><div><span className="eyebrow">EXPLORA A TU MANERA</span><h2>Los lugares más especiales<br/>están por descubrir.</h2></div><div className="landing-feature"><MapPin/><b>Encuentra lugares</b><span>Descubre destinos en el mapa.</span></div><div className="landing-feature"><Camera/><b>Encuentra perspectivas</b><span>Guarda los mejores photo spots.</span></div><div className="landing-feature"><CheckCircle2/><b>Vive experiencias</b><span>Completa actividades por zona.</span></div></section></div>}
export function Login({register=false}){const {login,register:signup}=useAuth(),nav=useNavigate(),[form,setForm]=useState({name:'',email:'',password:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false);const submit=async e=>{e.preventDefault();setBusy(true);setErr('');try{register?await signup(form.name,form.email,form.password):await login(form.email,form.password);nav('/city')}catch(e){setErr(errorMessage(e))}finally{setBusy(false)}};return <div className="auth-page"><div className="auth-art"><CityWorld onExplore={()=>{}}/><div className="auth-art-caption"><span className="eyebrow">ATLAS EXPLORER</span><h2>El mundo es demasiado grande para quedarse en un solo lugar.</h2></div></div><form className="auth-form" onSubmit={submit}><div className="brand"><span className="brand-mark"><Compass/></span>atlas<span className="brand-light">explorer</span></div><span className="eyebrow">{register?'ÚNETE A LA AVENTURA':'QUÉ BUENO TENERTE DE VUELTA'}</span><h1>{register?'Crea tu cuenta':'Inicia sesión'}</h1><p>{register?'Prepara tu próxima aventura.':'Continúa descubriendo lugares extraordinarios.'}</p>{err&&<div className="alert">{err}</div>}{register&&<label className="form-field">Nombre<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}<label className="form-field">Correo electrónico<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label className="form-field">Contraseña<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="primary-btn auth-submit" disabled={busy}>{busy?'Un momento…':register?'Crear cuenta':'Entrar a explorar'} <ArrowUpRight size={17}/></button><div className="auth-switch">{register?'¿Ya tienes cuenta?':'¿Todavía no tienes cuenta?'} <Link to={register?'/login':'/register'}>{register?'Inicia sesión':'Regístrate'}</Link></div></form></div>}

export function CityExplore(){
 const [locations,setLocations]=useState([]),[categories,setCategories]=useState([]),[zones,setZones]=useState([]),[ratings,setRatings]=useState({});
 const [category,setCategory]=useState(''),[zone,setZone]=useState(''),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[err,setErr]=useState('');
 const [counts,setCounts]=useState({categories:{},zones:{}});

 /**
  * El filtrado se resuelve en el backend.
  * El filtro por zona NO se puede hacer en el cliente: una ubicacion no guarda
  * a que zona pertenece, la relacion es geometrica y la calcula MongoDB con
  * $geoWithin contra el poligono de la zona.
  */
 const load=async()=>{setLoading(true);setErr('');try{
  const params={};if(category)params.category=category;if(zone)params.zone=zone;
  const [l,c,z]=await Promise.all([api.get('/locations',{params}),api.get('/categories'),api.get('/zones')]);
  setLocations(unwrap(l)||[]);setCategories(unwrap(c)||[]);setZones(unwrap(z)||[]);
 }catch(e){setErr(errorMessage(e))}finally{setLoading(false)}};
 useEffect(()=>{load()},[category,zone]);

 // Los contadores de cada categoria y zona tambien salen del backend, una sola vez
 useEffect(()=>{(async()=>{try{
  const [usage,zs,avg]=await Promise.all([api.get('/categories/usage'),api.get('/zones'),api.get('/locations/averages')]);
  const porCategoria={};(unwrap(usage)||[]).forEach(c=>{porCategoria[c.id]=c.locationsCount});
  const zonas=unwrap(zs)||[];
  const resumenes=await Promise.all(zonas.map(z=>api.get(`/zones/${z.id}/summary`).then(r=>unwrap(r)).catch(()=>null)));
  const porZona={};resumenes.forEach((s,i)=>{if(s)porZona[zonas[i].id]=s.locationsCount});
  setCounts({categories:porCategoria,zones:porZona});
  const estrellas={};(unwrap(avg)||[]).forEach(a=>{estrellas[a.locationId]={average:a.average,total:a.total}});
  setRatings(estrellas);
 }catch{/* los contadores son informativos: si fallan la vista sigue sirviendo */}})()},[]);

 const categoryIcon=(name)=>{const n=(name||'').toLowerCase();if(n.includes('parque')||n.includes('jard'))return Trees;if(n.includes('restaurante')||n.includes('comida'))return Utensils;if(n.includes('hotel'))return Hotel;if(n.includes('museo'))return Landmark;if(n.includes('mirador'))return Binoculars;if(n.includes('monumento'))return Landmark;return Building2};
 const rating=selected?ratings[selected.id]:null;
 const estrellas=n=>'★'.repeat(Math.round(n))+'☆'.repeat(5-Math.round(n));

 return <section className="city-page">
  <div className="city-page-heading"><div><span className="eyebrow">CENTRO DE EXPLORACIÓN</span><h1>Tu ciudad,<br/>lista para explorar.</h1><p>Pasa el cursor sobre los lugares y haz clic para descubrirlos.</p></div><div className="city-stats"><span><b>{locations.length}</b> lugares</span><span><b>{zones.length}</b> zonas</span><Link className="primary-btn" to="/map">Ver mapa real <MapPin size={15}/></Link></div></div>
  {err&&<div className="alert">{err}<button onClick={load}>Reintentar</button></div>}
  <div className="city-explore-layout">
   <div className="city-scene-column"><div className="city-scene-shell">
    <div className="city-scene-topline"><span className="destination-pill">ATLAS EXPLORER · TU DESTINO</span><span className="scene-counter">{loading?'Cargando lugares…':`${locations.length} lugares visibles`}</span></div>
    <CityWorld locations={locations} selectedId={selected?.id} onSelect={setSelected} filteredIds={locations.map(x=>x.id)}/>
    {!loading&&!locations.length&&<div className="city-empty-overlay">No hay lugares para esta combinación de filtros. Prueba otra categoría o zona.</div>}
    {selected&&<article className="city-place-card"><button className="close-mini" onClick={()=>setSelected(null)} aria-label="Cerrar">×</button><span className="eyebrow">{selected.category?.name||'DESTINO'}</span><h2>{selected.name}</h2><div className="city-card-rating"><span className="stars">{rating?estrellas(rating.average):'☆☆☆☆☆'}</span><small>{rating?`${rating.average} de 5 · ${rating.total} reseña(s)`:'Todavía sin reseñas'}</small></div><p>{selected.description||'Descubre este lugar y conoce más detalles de tu destino.'}</p><div className="city-card-address"><MapPin size={14}/>{selected.address||'Dirección no disponible'}</div><div className="row-actions"><Link className="primary-btn" to={`/location/${selected.id}`}>Ver ficha <ArrowUpRight size={14}/></Link><Link className="secondary-btn" to={`/map?location=${selected.id}`}>En el mapa <MapPin size={14}/></Link></div></article>}
   </div></div>
   <aside className="city-discovery-side">
    <div className="city-discovery-bar"><div><span className="eyebrow">DESCUBRIMIENTO</span><b>Explora por categoría</b></div><button className="subtle-btn" onClick={()=>setCategory('')}>Limpiar</button></div>
    <div className="category-explorer">{categories.map(c=>{const Icon=categoryIcon(c.name);const id=c.id||c._id;return <button key={id} className={`category-chip ${String(category)===String(id)?'active':''}`} style={{'--category-color':c.color||'#397f91'}} onClick={()=>setCategory(String(category)===String(id)?'':id)}><span className="category-icon"><Icon size={18}/></span><span><b>{c.name}</b><small>{counts.categories[id]??0} lugares</small></span></button>})}{!categories.length&&!loading&&<div className="empty-state">Todavía no hay categorías registradas.</div>}</div>
    <div className="zone-explorer"><div><span className="eyebrow">SECTORES</span><b>Explora por zona</b></div><div className="zone-pills"><button className={`zone-pill ${!zone?'active':''}`} onClick={()=>setZone('')}>Todas</button>{zones.map(z=>{const id=z.id||z._id;return <button key={id} className={`zone-pill ${String(zone)===String(id)?'active':''}`} onClick={()=>setZone(String(zone)===String(id)?'':id)}><i style={{background:z.color||'#4d9275'}}/>{z.name} <small>{counts.zones[id]??0}</small></button>})}</div></div>
   </aside>
  </div>
 </section>
}

export function Explore(){
 const {user}=useAuth();const navigate=useNavigate();const [searchParams]=useSearchParams();
 // Cualquiera con sesion puede REGISTRAR una ubicacion...
 const canModify=!!user;
 // ...pero editarla o borrarla solo quien la registro, o el administrador.
 // Es la misma regla que aplica la API; si no coincidiera, la interfaz
 // mostraria botones que el servidor rechaza con 403.
 const isOwner=loc=>{
  if(!user)return false;
  if(user.role==='admin')return true;
  const dueno=loc?.createdBy;
  return String(dueno?.id||dueno?._id||dueno||'')===String(user.id||user._id||'');
 };
 const [locations,setLocations]=useState([]),[categories,setCategories]=useState([]),[zones,setZones]=useState([]),[geo,setGeo]=useState(null);
 const [q,setQ]=useState(''),[cat,setCat]=useState(''),[zone,setZone]=useState('');
 const [selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[err,setErr]=useState(''),[ok,setOk]=useState('');
 const [point,setPoint]=useState(null),[editingLocation,setEditingLocation]=useState(null);
 const [draft,setDraft]=useState({name:'',description:'',category:'',address:'',priceLevel:1,status:'abierto'});

 // El filtrado se resuelve en el backend: los mismos query params alimentan el mapa y la tabla
 const load=async()=>{setLoading(true);setErr('');try{
  const params={};if(q.trim())params.search=q.trim();if(cat)params.category=cat;if(zone)params.zone=zone;
  const [l,c,z,g]=await Promise.all([api.get('/locations',{params}),api.get('/categories'),api.get('/zones'),api.get('/zones/geojson')]);
  const rows=unwrap(l)||[];setLocations(rows);setCategories(unwrap(c)||[]);setZones(unwrap(z)||[]);setGeo(g.data);
  const requested=searchParams.get('location');
  if(requested){const found=rows.find(x=>x.id===requested);if(found)setSelected(found)}
  else setSelected(current=>current&&rows.some(x=>x.id===current.id)?current:null);
 }catch(e){setErr(errorMessage(e))}finally{setLoading(false)}};
 useEffect(()=>{const t=setTimeout(load,220);return()=>clearTimeout(t)},[q,cat,zone]);

 // Los mensajes de exito se borran solos para no acumularse
 useEffect(()=>{if(!ok)return;const t=setTimeout(()=>setOk(''),3500);return()=>clearTimeout(t)},[ok]);

 const firstCoords=locations[0]?.location?.coordinates;
 const center=selected?.location?.coordinates?[selected.location.coordinates[1],selected.location.coordinates[0]]:firstCoords?[firstCoords[1],firstCoords[0]]:undefined;

 const emptyDraft={name:'',description:'',category:'',address:'',priceLevel:1,status:'abierto'};
 const closeForm=()=>{setPoint(null);setEditingLocation(null);setDraft(emptyDraft)};

 // Abre el formulario de edicion con los datos del lugar (se llama desde el popup y desde la tabla)
 const openEdit=loc=>{if(!loc)return;setSelected(loc);setPoint(null);setEditingLocation(loc);
  setDraft({name:loc.name||'',description:loc.description||'',category:loc.category?.id||'',address:loc.address||'',priceLevel:loc.priceLevel||1,status:loc.status||'abierto'})};

 const saveLocation=async e=>{e.preventDefault();setErr('');try{
  const body={...draft,priceLevel:Number(draft.priceLevel)};
  if(editingLocation){await api.patch(`/locations/${editingLocation.id}`,body);setOk(`Se actualizó "${body.name}".`)}
  else {await api.post('/locations',{...body,latitude:point.lat,longitude:point.lng});setOk(`Se registró "${body.name}".`)}
  closeForm();await load(); // Vuelve a pedir la lista: el mapa y la tabla se refrescan sin recargar la pagina
 }catch(e){setErr(errorMessage(e))}};

 const deleteLocation=async loc=>{const target=loc||selected;if(!target)return;
  if(!confirm(`¿Eliminar ${target.name}? También se eliminarán sus reseñas y photo spots.`))return;
  setErr('');try{
   const r=await api.delete(`/locations/${target.id}`);
   const removed=r.data?.removed;
   const extra=removed?` (${removed.reviews} reseña(s) y ${removed.photoSpots} photo spot(s))`:'';
   setOk(`Se eliminó "${target.name}"${extra}.`);
   if(selected?.id===target.id)setSelected(null);
   await load();
  }catch(e){setErr(errorMessage(e))}};

 const coordsOf=loc=>{const c=loc.location?.coordinates;return Array.isArray(c)&&c.length>1?`${Number(c[1]).toFixed(5)}, ${Number(c[0]).toFixed(5)}`:'—'};
 const fecha=v=>v?new Date(v).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}):'—';
 const precio=n=>n?'$'.repeat(Number(n)):'—';

 return <section><div className="page-heading"><div><div className="eyebrow">CARTOGRAFÍA Y DESCUBRIMIENTO</div><h1>Mapa real</h1><p>Haz clic en el mapa para registrar un lugar, y en un marcador para editarlo o eliminarlo.</p></div><div className="heading-pill"><span className="online-dot"/>{locations.length} lugares disponibles</div></div>

  <div className="map-explorer-toolbar"><div className="searchbox wide"><Search size={18}/><input placeholder="Busca un lugar por nombre…" value={q} onChange={e=>setQ(e.target.value)}/></div><select value={cat} onChange={e=>setCat(e.target.value)}><option value="">Todas las categorías</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={zone} onChange={e=>setZone(e.target.value)}><option value="">Todas las zonas</option>{zones.map(z=><option key={z.id} value={z.id}>{z.name}</option>)}</select>{(q||cat||zone)&&<button className="secondary-btn" onClick={()=>{setQ('');setCat('');setZone('')}}>Limpiar filtros</button>}</div>

  {ok&&<div className="notice-success"><CheckCircle2 size={16}/>{ok}<button onClick={()=>setOk('')} aria-label="Cerrar"><X size={14}/></button></div>}
  {err&&<div className="alert">{err}<button onClick={()=>setErr('')}><X size={14}/></button></div>}

  <div className="map-workspace"><aside className="map-results-panel"><div className="map-results-head"><div><span className="eyebrow">EXPLORA EL DESTINO</span><h2>Lugares registrados</h2><small>{loading?'Actualizando…':`${locations.length} resultados`}</small></div><SlidersHorizontal size={18}/></div><div className="map-results-list">{locations.map(l=><button key={l.id} className={`map-result-row ${selected?.id===l.id?'selected':''}`} onClick={()=>setSelected(l)}><span className="map-result-icon" style={{'--place-color':l.category?.color||'#397f91'}}><MapPin size={19}/></span><span className="map-result-copy"><b>{l.name}</b><small>{l.category?.name||'Destino'} · {l.address||'Ubicación registrada'}</small><em>{l.status||'Lugar turístico'}</em></span><ArrowUpRight size={16}/></button>)}{!loading&&!locations.length&&<div className="empty-state">No encontramos ubicaciones con estos filtros.</div>}</div>{selected&&<div className="map-selected-card"><button className="close-mini" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">LUGAR SELECCIONADO</span><b>{selected.name}</b><p>{selected.description}</p><div className="row-actions"><Link to={`/location/${selected.id}`} className="inline-link">Ver ficha <ArrowUpRight size={14}/></Link>{isOwner(selected)?<><button className="icon-btn" onClick={()=>openEdit(selected)} title="Editar ubicación" aria-label={`Editar ${selected.name}`}><Edit3 size={15}/></button><button className="icon-btn danger" onClick={()=>deleteLocation(selected)} title="Eliminar ubicación" aria-label={`Eliminar ${selected.name}`}><Trash2 size={15}/></button></>:<span className="muted-inline">{user?'Registrada por otro viajero':'Solo lectura'}</span>}</div></div>}</aside>

   <div className="map-panel map-canvas-panel"><div className="panel-top"><div><b>Mapa geográfico</b><small>{canModify?'Haz clic en el mapa para registrar una ubicación':'Inicia sesión para registrar lugares'}</small></div><span className="map-tag"><MapIcon size={14}/> LEAFLET · OPENSTREETMAP</span></div><MapView locations={locations} zonesGeo={geo} onSelect={setSelected} onViewDetails={loc=>navigate(`/location/${loc.id}`)} center={center} selectedZoneId={zone} interactive={canModify} onMapClick={canModify?setPoint:undefined} canModifyLocation={isOwner} onEditLocation={openEdit} onDeleteLocation={deleteLocation}/></div>
  </div>

  {/* Tabla de ubicaciones registradas: todos los campos menos el ID, la categoria por su nombre */}
  <section className="locations-table-section"><div className="section-heading"><div><span className="eyebrow">INFORMACIÓN EN TIEMPO REAL</span><h2>Ubicaciones registradas</h2><small className="table-subtitle">Se actualiza al crear, editar o eliminar un lugar, sin recargar la página.</small></div><span className="result-badge">{locations.length} registros</span></div>
   <div className="table-card"><div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Descripción</th><th>Categoría</th><th>Dirección</th><th>Precio</th><th>Estado</th><th>Coordenadas (lat, lng)</th><th>Registrado por</th><th>Creado</th><th>Actualizado</th><th>Acciones</th></tr></thead>
    <tbody>{loading?<tr><td colSpan="11">Cargando ubicaciones…</td></tr>:locations.length===0?<tr><td colSpan="11" className="empty-cell">No hay ubicaciones con estos filtros.</td></tr>:locations.map(l=><tr key={l.id} className={selected?.id===l.id?'row-selected':''} onClick={()=>setSelected(l)}>
     <td><b>{l.name}</b></td>
     <td className="cell-wrap">{l.description||'—'}</td>
     <td><span className="category-tag" style={{'--tag-color':l.category?.color||'#397f91'}}>{l.category?.name||'Sin categoría'}</span></td>
     <td className="cell-wrap">{l.address||'—'}</td>
     <td>{precio(l.priceLevel)}</td>
     <td><span className={`status-tag status-${l.status||'abierto'}`}>{l.status||'—'}</span></td>
     <td className="cell-coords">{coordsOf(l)}</td>
     <td>{l.createdBy?.name||'Comunidad'}</td>
     <td>{fecha(l.createdAt)}</td>
     <td>{fecha(l.updatedAt)}</td>
     <td><div className="row-actions"><Link to={`/location/${l.id}`} className="icon-btn" title="Ver ficha" aria-label={`Ver ficha de ${l.name}`} onClick={e=>e.stopPropagation()}><ArrowUpRight size={15}/></Link>{isOwner(l)?<><button className="icon-btn" title="Editar" aria-label={`Editar ${l.name}`} onClick={e=>{e.stopPropagation();openEdit(l)}}><Edit3 size={15}/></button><button className="icon-btn danger" title="Eliminar" aria-label={`Eliminar ${l.name}`} onClick={e=>{e.stopPropagation();deleteLocation(l)}}><Trash2 size={15}/></button></>:<span className="muted-inline">{user?'De otro viajero':'Solo lectura'}</span>}</div></td>
    </tr>)}</tbody></table></div></div>
  </section>

  {canModify&&(point||editingLocation)&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&closeForm()}><form className="modal" onSubmit={saveLocation}><div className="modal-head"><div><span className="eyebrow">{editingLocation?'EDITAR UBICACIÓN':'NUEVA UBICACIÓN'}</span><h2>{editingLocation?'Actualizar lugar':'Guardar este lugar'}</h2><small>{point?`${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`:'Modifica la información registrada.'}</small></div><button type="button" className="icon-btn" onClick={closeForm}><X/></button></div><label className="form-field">Nombre<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label className="form-field">Descripción<input required value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label><label className="form-field">Categoría<select required value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}><option value="">Selecciona una categoría</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="form-field">Dirección<input value={draft.address} onChange={e=>setDraft({...draft,address:e.target.value})}/></label><div className="zone-form-row"><label className="form-field">Nivel de precio<select value={draft.priceLevel} onChange={e=>setDraft({...draft,priceLevel:e.target.value})}>{[1,2,3,4].map(n=><option key={n} value={n}>{'$'.repeat(n)}</option>)}</select></label><label className="form-field">Estado<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{['abierto','cerrado','temporal'].map(x=><option key={x}>{x}</option>)}</select></label></div><div className="modal-actions"><button type="button" className="secondary-btn" onClick={closeForm}>Cancelar</button><button className="primary-btn">{editingLocation?'Guardar cambios':'Guardar ubicación'}</button></div></form></div>}
 </section>
}
export function LocationDetail(){
 const {id}=useParams();const {user}=useAuth();
 const [data,setData]=useState(null),[err,setErr]=useState(''),[review,setReview]=useState({rating:5,comment:''}),[busy,setBusy]=useState(false);
 const load=async()=>{try{setErr('');setData(unwrap(await api.get(`/locations/${id}/detail`)))}catch(e){setErr(errorMessage(e))}};
 useEffect(()=>{load()},[id]);
 const loc=data?.location||data;
 const myReview=(data?.reviews||[]).find(r=>String(r.author?.id||r.author?._id||r.author)===String(user?.id||user?._id));
 useEffect(()=>{if(myReview)setReview({rating:myReview.rating,comment:myReview.comment||''})},[myReview?.id]);
 const submit=async e=>{e.preventDefault();setBusy(true);setErr('');try{const body={rating:Number(review.rating),comment:review.comment};if(myReview)await api.patch(`/reviews/${myReview.id}`,body);else await api.post('/reviews',{...body,location:id});await load()}catch(e){setErr(errorMessage(e))}finally{setBusy(false)}};
 if(err&&!data)return <div className="alert">{err}<Link to="/city">Volver a la ciudad</Link></div>;
 if(!data)return <div className="loading-state">Cargando destino…</div>;
 const coords=loc.location?.coordinates;const center=coords?[coords[1],coords[0]]:[loc.latitude||41.9028,loc.longitude||12.4964];
 return <section className="location-detail-page"><Link to="/city" className="inline-link">← Volver a la ciudad</Link>
  <div className="detail-hero"><div><span className="eyebrow">{loc.category?.name||'DESTINO'}</span><h1>{loc.name}</h1><p>{loc.description}</p><span className="detail-address"><MapPin size={16}/>{loc.address||'Ubicación geográfica'}</span></div><div className="rating-bubble"><Star fill="currentColor"/><b>{data.rating?.average??'—'}</b><small>{data.rating?.total??data.reviews?.length??0} reseñas</small></div></div>
  {err&&<div className="alert">{err}<button onClick={()=>setErr('')}>Cerrar</button></div>}
  <div className="detail-columns"><div className="detail-main-column">
    <div className="detail-photo-placeholder"><Camera size={27}/><b>La experiencia comienza aquí</b><span>No hay fotografías registradas para este lugar todavía.</span></div>
    <section className="detail-section"><div className="section-heading"><div><span className="eyebrow">PERSPECTIVAS DEL DESTINO</span><h2>Photo spots</h2></div><Link to="/photo-spots" className="inline-link">Explorar <ArrowUpRight size={15}/></Link></div>
     {(data.photoSpots||[]).length?<div className="mini-cards">{data.photoSpots.map(p=><article className="mini-card" key={p.id}><Camera/><b>{p.title}</b><p>{p.description}</p><small>Mejor momento: {p.bestTime||'Sin especificar'}</small></article>)}</div>:<div className="detail-empty">Todavía no hay photo spots registrados para este lugar.</div>}
    </section>
    <section className="detail-section"><div className="section-heading"><div><span className="eyebrow">VOCES VIAJERAS</span><h2>Reseñas</h2></div><span className="result-badge">{data.rating?.total??data.reviews?.length??0}</span></div>
     {(data.reviews||[]).map(r=><article className="review-card" key={r.id}><div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div><p>{r.comment}</p><small>{r.author?.name||'Viajero'}{r.createdAt?` · ${new Date(r.createdAt).toLocaleDateString('es-MX')}`:''}</small></article>)}
     {user&&<form className="review-form" onSubmit={submit}><h3>{myReview?'Actualiza tu reseña':'Comparte tu experiencia'}</h3><label className="form-field">Calificación<select value={review.rating} onChange={e=>setReview({...review,rating:e.target.value})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} estrellas</option>)}</select></label><label className="form-field">Comentario<textarea required maxLength={1200} value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})} placeholder="¿Qué fue lo que más disfrutaste?"/></label><button className="primary-btn" disabled={busy}>{busy?'Publicando…':myReview?'Actualizar reseña':'Publicar reseña'}</button></form>}
    </section>
   </div><aside className="detail-side-column"><div className="detail-map-card"><div className="section-heading"><div><span className="eyebrow">UBICACIÓN</span><h3>Encuéntralo en el mapa</h3></div><MapIcon size={18}/></div><MapView locations={[loc]} center={center}/><Link className="inline-link" to={`/map?location=${loc.id}`}>Abrir mapa real <ArrowUpRight size={15}/></Link></div><div className="detail-aside"><span className="eyebrow">INFORMACIÓN DEL LUGAR</span><h3>Detalles</h3><p><b>Estado:</b> {loc.status||'No especificado'}</p><p><b>Categoría:</b> {loc.category?.name||'Sin categoría'}</p><p><b>Nivel de precio:</b> {loc.priceLevel||'No especificado'}</p><p><b>Registrado por:</b> {loc.createdBy?.name||'Comunidad'}</p></div><div className="detail-aside photo-spot-callout"><Camera size={20}/><b>¿Encontraste una buena perspectiva?</b><p>Comparte el punto desde donde se aprecia mejor este lugar.</p><Link to="/photo-spots" className="inline-link">Registrar photo spot <ArrowUpRight size={15}/></Link></div></aside></div>
 </section>
}
export function Checklist(){
 const [groups,setGroups]=useState([]),[progress,setProgress]=useState({completed:0,total:0}),[err,setErr]=useState(''),[loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);setErr('');try{const d=unwrap(await api.get('/activities/my-checklist'));const gs=Array.isArray(d)?d:(d?.zones||d?.groups||[]);setGroups(gs);const all=gs.flatMap(g=>g.activities||[]);setProgress(d?.progress||{completed:all.filter(a=>a.completed).length,total:all.length});}catch(e){setErr(errorMessage(e))}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const toggle=async a=>{try{await api({method:a.completed?'delete':'post',url:`/activities/${a.id}/complete`});await load()}catch(e){setErr(errorMessage(e))}};
 const pct=progress.total?Math.round(progress.completed/progress.total*100):0;
 return <section><div className="page-heading"><div><div className="eyebrow">TU VIAJE, A TU RITMO</div><h1>Mi aventura</h1><p>Pequeñas experiencias que hacen inolvidable cada destino.</p></div><div className="progress-ring"><b>{pct}%</b><small>completado</small></div></div>{err&&<div className="alert">{err}<button onClick={load}>Reintentar</button></div>}<div className="progress-card"><div><span className="eyebrow">PROGRESO GENERAL</span><h2>{progress.completed} de {progress.total} experiencias</h2><p>Cada lugar guarda algo nuevo por descubrir.</p></div><div className="progress-track"><i style={{width:`${pct}%`}}/></div></div>{loading?<div className="empty-state">Cargando tus experiencias…</div>:groups.length===0?<div className="empty-state">Todavía no hay actividades registradas. El equipo de Atlas Explorer irá agregando experiencias para descubrir.</div>:groups.map(group=><section className="checklist-zone" key={group.zone?.id||group.zone?.name||'sin-zona'}><div className="checklist-zone-head"><div><span className="eyebrow">ZONA</span><h2>{group.zone?.name||'Experiencias generales'}</h2></div><span className="zone-progress">{group.completed||0}/{group.total||group.activities?.length||0} completadas</span></div><div className="checklist-grid">{(group.activities||[]).map(a=><label className={'task-card '+(a.completed?'done':'')} key={a.id}><input type="checkbox" checked={!!a.completed} onChange={()=>toggle(a)}/><span className="task-check"><CheckCircle2/></span><span className="task-copy"><b>{a.title}</b><small>{group.zone?.name||'Zona por descubrir'} · {a.difficulty||'Experiencia'}</small>{a.description&&<p>{a.description}</p>}</span><span className="task-count">{a.completedCount||0} viajeros</span></label>)}</div></section>)}</section>
}
export function Categories(){return <CrudPage kind="categories"/>}export function Activities(){return <CrudPage kind="activities"/>}export function PhotoSpots(){return <CrudPage kind="photoSpots"/>}export function Reviews(){return <CrudPage kind="reviews"/>}
export function Zones(){
 const {user}=useAuth();
 // Cualquiera con sesion puede TRAZAR una zona...
 const canModify=!!user;
 // ...pero editarla o borrarla solo quien la trazo, o el administrador
 const isOwner=z=>{
  if(!user)return false;
  if(user.role==='admin')return true;
  const dueno=z?.createdBy;
  return String(dueno?.id||dueno?._id||dueno||'')===String(user.id||user._id||'');
 };
 const [zones,setZones]=useState([]),[geo,setGeo]=useState(null),[name,setName]=useState(''),[desc,setDesc]=useState(''),[color,setColor]=useState('#4d9275'),[points,setPoints]=useState([]),[editing,setEditing]=useState(null),[selectedZone,setSelectedZone]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{try{const [z,g]=await Promise.all([api.get('/zones'),api.get('/zones/geojson')]);setZones(unwrap(z)||[]);setGeo(g.data)}catch(e){setMsg(errorMessage(e))}};
 useEffect(()=>{load()},[]);
 const getZoneCenter=z=>{const ring=geo?.features?.find(f=>String(f.properties?.id)===String(z.id))?.geometry?.coordinates?.[0];if(!ring?.length)return null;const vertices=ring.slice(0,-1);if(!vertices.length)return null;const sum=vertices.reduce((acc,[lng,lat])=>({lng:acc.lng+lng,lat:acc.lat+lat}),{lng:0,lat:0});return {lat:sum.lat/vertices.length,lng:sum.lng/vertices.length}};
 const beginEdit=z=>{setEditing(z);setName(z.name||'');setDesc(z.description||'');setColor(z.color||'#4d9275');const feature=geo?.features?.find(f=>f.properties?.id===z.id);const ring=feature?.geometry?.coordinates?.[0]||[];setPoints(ring.slice(0,-1).map(([lng,lat])=>[lat,lng]));setSelectedZone(z.id)};
 const reset=()=>{setEditing(null);setName('');setDesc('');setColor('#4d9275');setPoints([])};
 const save=async e=>{e.preventDefault();if(points.length<3){setMsg('Agrega al menos tres puntos sobre el mapa para formar la zona.');return}setBusy(true);setMsg('');try{const body={name,description:desc,color,coordinates:points.map(([lat,lng])=>[lng,lat])};if(editing)await api.patch(`/zones/${editing.id}`,body);else await api.post('/zones',body);reset();await load();setMsg(editing?'Zona actualizada correctamente.':'Zona creada correctamente.')}catch(e){setMsg(errorMessage(e))}finally{setBusy(false)}};
 const remove=async z=>{if(!confirm(`¿Eliminar ${z.name} y las actividades asociadas?`))return;try{await api.delete(`/zones/${z.id}`);if(selectedZone===z.id)setSelectedZone('');await load()}catch(e){setMsg(errorMessage(e))}};
 return <section><div className="page-heading"><div><div className="eyebrow">TERRITORIO Y GEOGRAFÍA</div><h1>Zonas del mapa</h1><p>Consulta las áreas geográficas y descubre qué actividades pertenecen a cada sector.</p></div></div>{msg&&<div className="alert">{msg}<button onClick={()=>setMsg('')}>×</button></div>}
  <div className="zones-workspace"><div className="map-panel zone-drawing-map"><div className="panel-top"><div><b>{canModify?'Dibuja o selecciona una zona':'Polígonos registrados'}</b><small>{canModify?'Haz clic en el mapa para agregar vértices al polígono':'Selecciona una zona para consultar su área'}</small></div><span className="map-tag">GEOJSON</span></div><MapView zonesGeo={geo} selectedZoneId={selectedZone} interactive={canModify} onMapClick={canModify?(p=>setPoints(v=>[...v,[p.lat,p.lng]])):undefined} draftPoints={points}/></div>
   <aside className="zone-side-panel"><div className="panel-top"><div><b>Zonas disponibles</b><small>{zones.length} sectores registrados</small></div></div><div className="zone-list-items">{/* Antes todo el renglon era un <button> y dentro iban dos <span role="button">.
    Un boton no puede contener otros botones, y los span no tienen nombre que
    un lector de pantalla pueda anunciar. Ahora el renglon es un <div> con
    tres botones de verdad, cada uno con su aria-label. */}
{zones.map(z=><div key={z.id} className={`zone-list-item ${selectedZone===z.id?'selected':''}`}><button type="button" className="zone-list-main" aria-label={`Seleccionar la zona ${z.name}`} aria-pressed={selectedZone===z.id} onClick={()=>setSelectedZone(z.id)}><i style={{background:z.color}}/><span><b>{z.name}</b><small>{z.description||'Área geográfica'}</small>{(()=>{const center=getZoneCenter(z);return center?<small className="zone-coordinates">Centro aprox. {center.lat.toFixed(5)}, {center.lng.toFixed(5)}</small>:<small className="zone-coordinates">Coordenadas no disponibles</small>})()}</span></button><span className="zone-item-actions">{isOwner(z)&&<><button type="button" className="zone-action-btn" title="Editar zona" aria-label={`Editar la zona ${z.name}`} onClick={()=>beginEdit(z)}><Edit3 size={15}/></button><button type="button" className="zone-action-btn danger" title="Eliminar zona" aria-label={`Eliminar la zona ${z.name}`} onClick={()=>remove(z)}><Trash2 size={15}/></button></>}</span></div>)}</div></aside></div>
  {canModify&&<form className="zone-create zone-draw-form" onSubmit={save}><div className="zone-form-title"><div><span className="eyebrow">{editing?'EDITAR ZONA':'ADMINISTRACIÓN DEL TERRITORIO'}</span><h3>{editing?'Actualiza el sector':'Crear una nueva zona'}</h3><p>Haz clic en el mapa para marcar los vértices. Se necesitan al menos tres puntos.</p></div><span className="vertex-count">{points.length} puntos</span></div><div className="zone-form-row"><label className="form-field">Nombre de la zona<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. Centro Histórico"/></label><label className="form-field">Color identificador<input type="color" value={color} onChange={e=>setColor(e.target.value)}/></label></div><label className="form-field">Descripción<input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe el sector turístico"/></label><div className="zone-form-actions"><div><button type="button" className="secondary-btn" onClick={()=>setPoints(p=>p.slice(0,-1))} disabled={!points.length}>Deshacer punto</button><button type="button" className="secondary-btn" onClick={()=>setPoints([])} disabled={!points.length}>Limpiar polígono</button></div><div><button type="button" className="secondary-btn" onClick={reset}>Cancelar</button><button className="primary-btn" disabled={busy||points.length<3}>{busy?'Guardando…':editing?'Guardar cambios':'Crear zona'}</button></div></div></form>}
  {!canModify&&<div className="notice-card"><Lock size={17}/> Inicia sesión para dibujar y administrar zonas.</div>}
 </section>
}
