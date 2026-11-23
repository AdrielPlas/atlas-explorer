import React, { useMemo } from 'react';
import {MapPin,Sparkles} from 'lucide-react';

const slots = [
  [255, 300], [365, 225], [475, 310], [585, 225], [690, 330], [390, 430], [535, 475], [735, 455], [190, 420], [640, 150]
];
const buildings = [
  { x: 205, y: 250, w: 82, h: 118, roof: '#d8b58b', left: '#b7b1a0', right: '#8f9c91', windows: true },
  { x: 330, y: 155, w: 98, h: 150, roof: '#b9d4cc', left: '#d5c9b4', right: '#9eaa9e', windows: true },
  { x: 470, y: 245, w: 88, h: 128, roof: '#e6a27b', left: '#e4d6be', right: '#b4a58f', windows: true },
  { x: 590, y: 145, w: 102, h: 160, roof: '#b6c9a1', left: '#d9d2c2', right: '#a49d8d', windows: true },
  { x: 695, y: 270, w: 82, h: 120, roof: '#d5c7ad', left: '#c5b9a3', right: '#928f82', windows: true },
  { x: 290, y: 405, w: 92, h: 120, roof: '#c9d9d1', left: '#e4d7c2', right: '#b3a68f', windows: true },
  { x: 505, y: 430, w: 105, h: 138, roof: '#d6a47d', left: '#d8c9b1', right: '#9c9b8d', windows: true },
  { x: 700, y: 430, w: 88, h: 115, roof: '#b7d1d2', left: '#e2d6c2', right: '#a69e8f', windows: true },
];
function Tree({x,y,scale=1,tone='#5b9878'}) { return <g transform={`translate(${x} ${y}) scale(${scale})`}><ellipse cy="18" rx="18" ry="7" fill="#617f69" opacity=".18"/><path d="M0 4v20" stroke="#8a7659" strokeWidth="5"/><circle cy="-7" r="17" fill={tone}/><circle cx="-8" cy="-13" r="10" fill="#83b18a"/><circle cx="7" cy="-16" r="9" fill="#a4c58e"/></g> }
function Building({b,index}) { const {x,y,w,h}=b; const roofY=y-h; return <g className="city-building" style={{'--building-delay':`${index*45}ms`}}>
  <path d={`M${x} ${y} l${w/2} 25 ${w/2} -25 -${w/2} -25Z`} fill={b.roof} stroke="#b6ad98" strokeWidth="2"/>
  <path d={`M${x} ${y} v${h*.64} l${w/2} 25 v-${h*.64}Z`} fill={b.left} stroke="#b4aa97" strokeWidth="1.5"/>
  <path d={`M${x+w} ${y} v${h*.64} l-${w/2} 25 v-${h*.64}Z`} fill={b.right} stroke="#9e9a8b" strokeWidth="1.5"/>
  <path d={`M${x} ${y} l${w/2} 25 ${w/2} -25`} fill="none" stroke="#f7f0df" strokeWidth="4"/>
  {Array.from({length:3},(_,r)=>Array.from({length:2},(_,c)=><g key={`${r}-${c}`}><path d={`M${x+12+c*22} ${y+18+r*25} l10 5 v14 l-10 -5Z`} fill="#8dbfc0" stroke="#f5ead6" strokeWidth="2"/><path d={`M${x+w/2+4+c*19} ${y+18+r*25} l9 -5 v14 l-9 5Z`} fill="#8dbfc0" stroke="#f5ead6" strokeWidth="2"/></g>))}
  <path d={`M${x+w/2-8} ${y-h*.38} l16 8 v25 l-16 -8Z`} fill="#b9855f" opacity=".8"/>
  <path d={`M${x+5} ${roofY+4} l${w/2-5} -${w/4} ${w/2-5} ${w/4}`} fill="none" stroke="#fff8e9" strokeWidth="3" opacity=".8"/>
 </g> }
export default function CityWorld({ locations=[], selectedId, onSelect, onExplore, filteredIds=null }) {
 const visible = useMemo(()=>locations.slice(0,slots.length),[locations]);
 return <div className="city-world" aria-label="Ciudad isométrica interactiva">
  <svg className="city-world-svg" viewBox="0 0 920 690" role="img" aria-label="Ilustración isométrica de una ciudad con edificios, calles, parques y lugares turísticos">
   <defs>
    <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b7dcdb"/><stop offset="1" stopColor="#e0eee2"/></linearGradient>
    <linearGradient id="cityRoad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c9c7b8"/><stop offset="1" stopColor="#e4dfcc"/></linearGradient>
    <pattern id="cityGrid" width="70" height="40" patternUnits="userSpaceOnUse"><path d="M0 20L35 0 70 20 35 40Z" fill="none" stroke="#b6c5a7" strokeWidth="1" opacity=".55"/></pattern>
    <filter id="cityShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#315a50" floodOpacity=".17"/></filter>
   </defs>
   <rect width="920" height="690" rx="28" fill="url(#citySky)"/>
   <circle cx="775" cy="100" r="54" fill="#f8e5b7" opacity=".55"/><circle cx="775" cy="100" r="34" fill="#fff3d2" opacity=".65"/>
   <path d="M35 370L455 135 890 365 455 615Z" fill="#b5d0a4" stroke="#a4c49a" strokeWidth="3"/>
   <path d="M35 370L455 135 890 365 455 615Z" fill="url(#cityGrid)"/>
   <path d="M-25 505L455 235 960 510" fill="none" stroke="#f4efdf" strokeWidth="76"/><path d="M-25 505L455 235 960 510" fill="none" stroke="#c4c4b4" strokeWidth="2" strokeDasharray="15 14"/>
   <path d="M245 700L455 580 720 700" fill="none" stroke="#f4efdf" strokeWidth="66"/><path d="M245 700L455 580 720 700" fill="none" stroke="#c4c4b4" strokeWidth="2" strokeDasharray="14 13"/>
   <g filter="url(#cityShadow)"><path d="M80 390l130-72 125 70-130 74Z" fill="#c4d9ad"/><path d="M90 395l120-67 112 63-120 68Z" fill="#d7e5be"/><path d="M620 360l110-62 112 64-110 63Z" fill="#c5d9ae"/><path d="M630 365l100-56 100 57-100 57Z" fill="#dce7c4"/></g>
   <g>{buildings.map((b,i)=><Building key={i} b={b} index={i}/>)}</g>
   <g>{[[120,380,.9],[165,410,.8],[255,500,.9],[420,375,.8],[460,395,.75],[625,390,.9],[800,390,.85],[145,300,.7],[300,335,.75],[555,330,.7],[760,240,.8],[390,535,.7],[650,535,.8],[835,490,.75]].map((p,i)=><Tree key={i} x={p[0]} y={p[1]} scale={p[2]} tone={i%3===0?'#4e8d73':i%3===1?'#6ba27c':'#86b58a'}/>)}</g>
   <g className="city-details"><path d="M92 270l34-19 34 19-34 19Z" fill="#e8b17e"/><path d="M92 270v30l34 20v-31Z" fill="#bd8964"/><path d="M160 450l42-24 42 24-42 24Z" fill="#b5d4ce"/><path d="M160 450v22l42 24v-22Z" fill="#85aaa0"/><path d="M690 180l36-20 36 20-36 21Z" fill="#df9c76"/><path d="M690 180v34l36 20v-33Z" fill="#b9785a"/></g>
   <g className="city-landmarks"><path d="M460 170l32-18 32 18-32 18Z" fill="#f1d8a7"/><path d="M460 170v48l32 18v-48Z" fill="#d2b68a"/><path d="M524 170v48l-32 18v-48Z" fill="#b99c76"/><path d="M480 150l12-20 12 20" fill="#e2a27b"/><path d="M476 193h32v18h-32Z" fill="#8fb8b2"/></g>
   {visible.map((loc,i)=>{const [x,y]=slots[i];const active=selectedId===loc.id;const dim=filteredIds&&!filteredIds.includes(loc.id);const color=loc.category?.color||'#397f91';return <g key={loc.id} className={`city-hotspot ${active?'is-selected':''} ${dim?'is-dimmed':''}`} transform={`translate(${x} ${y})`} role="button" tabIndex="0" aria-label={`Explorar ${loc.name}`} onClick={()=>onSelect?.(loc)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(loc)}}}>
      <circle className="hotspot-pulse" r="24" fill={color} opacity=".16"/><circle r="13" fill="#fff" stroke="#fff" strokeWidth="4"/><circle r="9" fill={color}/><path d="M0 14v22" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><path d="M0 14v22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><g className="hotspot-label"><rect x="-82" y="-48" width="164" height="27" rx="13" fill="#263b3b"/><text x="0" y="-30" textAnchor="middle">{loc.name.length>22?loc.name.slice(0,20)+'…':loc.name}</text></g>
     </g>})}
  </svg>
  <div className="city-scene-caption"><span><Sparkles size={14}/> CIUDAD ILUSTRADA</span><small>Vista conceptual · ubicaciones reales vinculadas a la ficha</small></div>
  {onExplore&&<div className="city-hero-copy"><span className="eyebrow">ATLAS EXPLORER</span><h1>Un mundo por<br/><em>descubrir.</em></h1><p>Explora rincones, encuentra lugares especiales y crea tu propia aventura.</p><button className="primary-btn" onClick={onExplore}>Entrar a explorar <MapPin size={15}/></button></div>}
 </div>
}
