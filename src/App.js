import { useState, useEffect } from "react";
import { supabase } from "./supabase";
const P = {
  bg:"#f4f0e8", paper:"#faf8f4", ink:"#1e1a14", sage:"#4a6741",
  sageL:"#e8ede6", stone:"#8c8278", pebble:"#c8c0b4", straw:"#c49a3c",
  bark:"#7a4f2a", barkL:"#f5ede3",
};
const R = 11;
const FD = "'Lora',Georgia,serif";
const FB = "'DM Sans',system-ui,sans-serif";
const FM = "'DM Mono',monospace";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${P.bg};font-family:${FB};color:${P.ink};font-size:15px;-webkit-font-smoothing:antialiased;}
button,input,textarea,select{font-family:${FB};}
input:focus,textarea:focus,select:focus{outline:2px solid ${P.sage};outline-offset:2px;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${P.pebble};border-radius:99px;}
@keyframes up{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@keyframes in{from{opacity:0;}to{opacity:1;}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}
`;

const RIDES = [
  {id:1,  drv:"Mia Torres",  av:"MT", fr:"Newtown",    to:"CBD",            t:"7:30 AM", s:2, cost:"split", pp:4.50, pr:4.8, vr:4.6, live:true,  km:6,  pro:true,  rec:true,  days:["Mon","Tue","Wed","Thu","Fri"], stu:false, music:"Passenger aux 🎤 · Pop, R&B"},
  {id:2,  drv:"Jake Hollis", av:"JH", fr:"Parramatta", to:"Olympic Park",   t:"8:00 AM", s:1, cost:"free",  pp:0,    pr:4.2, vr:3.9, live:true,  km:9,  pro:false, rec:false, days:[], stu:false, music:"Silence is golden 🤫"},
  {id:3,  drv:"Chen Wei",    av:"CW", fr:"Bondi",      to:"Surry Hills",    t:"8:15 AM", s:3, cost:"split", pp:5.00, pr:5.0, vr:4.9, live:false, km:8,  pro:true,  rec:true,  days:["Mon","Wed","Fri"], stu:false, music:"90s only, no skips 🎵"},
  {id:4,  drv:"Sarah K.",    av:"SK", fr:"Penrith",    to:"Blacktown",      t:"7:45 AM", s:2, cost:"free",  pp:0,    pr:4.5, vr:4.0, live:true,  km:14, pro:false, rec:false, days:[], stu:false, music:"Kid-friendly vibes 🎈"},
  {id:5,  drv:"Omar R.",     av:"OR", fr:"Chatswood",  to:"North Sydney",   t:"8:30 AM", s:1, cost:"fixed", pp:3.50, pr:3.8, vr:4.2, live:false, km:5,  pro:false, rec:false, days:[], stu:false, music:"True crime podcasts 😂"},
  {id:6,  drv:"Lena Park",   av:"LP", fr:"Hornsby",    to:"Macquarie Uni",  t:"7:50 AM", s:3, cost:"split", pp:4.00, pr:4.9, vr:4.7, live:true,  km:11, pro:true,  rec:true,  days:["Mon","Tue","Wed","Thu","Fri"], stu:true,  music:"Passenger aux 🎤 · Indie, K-Pop"},
  {id:7,  drv:"Priya S.",    av:"PS", fr:"Pukekohe",   to:"Auckland CBD",   t:"7:00 AM", s:2, cost:"split", pp:6.50, pr:4.7, vr:4.5, live:true,  km:52, pro:false, rec:true,  days:["Mon","Tue","Wed","Thu","Fri"], stu:false, music:"Classic rock 🤘"},
  {id:8,  drv:"Tom W.",      av:"TW", fr:"Levin",      to:"Wellington CBD", t:"6:45 AM", s:3, cost:"split", pp:8.00, pr:4.6, vr:4.3, live:false, km:88, pro:false, rec:true,  days:["Mon","Wed","Fri"], stu:false, music:""},
];

const URGENT_SEED = [
  {id:101, drv:"Alex Stone", av:"AS", fr:"Strathfield", to:"Central", t:"Now", s:1, cost:"free", pp:0, pr:4.4, vr:4.1, live:true, km:7, pro:false, rec:false, days:[], stu:false, music:"", urgent:true},
];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const costColor = r => r.cost==="fixed" ? P.bark : P.sage;
const costLabel = r => r.cost==="free" ? "Free 🌿" : `$${r.pp.toFixed(2)}`;
const costSub   = r => r.cost==="free" ? "driver's shout" : r.cost==="split" ? "fuel split" : "fixed";

function Stars({v=0, n=5, size=12}) {
  return (
    <span style={{display:"inline-flex",gap:1}}>
      {Array.from({length:n},(_,i)=>(
        <span key={i} style={{color:P.straw,fontSize:size}}>
          {v>=i+1?"★":v>=i+.5?"⯨":"☆"}
        </span>
      ))}
    </span>
  );
}

function Tag({c, children}) {
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:99,
    fontSize:11,background:c?c+"18":P.sageL,color:c||P.sage,fontFamily:FM}}>{children}</span>;
}

function Pill({label, color=P.sage}) {
  return <Tag c={color}>{label}</Tag>;
}

function Av({av, size=36, live, pro, stu}) {
  return (
    <div style={{position:"relative",flexShrink:0,width:size,height:size}}>
      <div style={{width:"100%",height:"100%",borderRadius:"50%",background:P.sageL,
        border:`1.5px solid ${pro?P.bark:stu?P.sage:P.pebble}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:FM,fontSize:size*.32,color:pro?P.bark:P.sage}}>
        {av}
      </div>
      {live && <span style={{position:"absolute",bottom:0,right:0,width:8,height:8,
        borderRadius:"50%",background:P.sage,border:`1.5px solid ${P.bg}`,
        animation:"blink 2s ease infinite"}}/>}
      {pro  && <span style={{position:"absolute",top:-3,right:-3,fontSize:9}}>✦</span>}
      {stu&&!pro && <span style={{position:"absolute",top:-3,right:-3,fontSize:9}}>🎓</span>}
    </div>
  );
}

function Btn({children, onClick, disabled, outline, small, fullWidth, color}) {
  const bg = disabled ? P.pebble : color || P.sage;
  return (
    <button onClick={disabled?undefined:onClick} style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",gap:5,
      padding:small?"6px 13px":"10px 20px", fontSize:small?12:14,
      fontWeight:500, borderRadius:R, cursor:disabled?"default":"pointer",
      border:outline?`1px solid ${P.pebble}`:"none",
      background:outline?"transparent":bg,
      color:outline?P.stone:"#fff",
      opacity:disabled?.5:1,
      width:fullWidth?"100%":"auto",
      transition:"opacity .15s",
    }}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=".82";}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>
      {children}
    </button>
  );
}

function Modal({title, onClose, children}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(20,16,10,.5)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,
      animation:"in .15s"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:P.paper,borderRadius:R+4,padding:26,width:370,
        maxHeight:"88vh",overflowY:"auto",animation:"up .2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:18}}>
          <h2 style={{fontFamily:FD,fontSize:18,fontWeight:600}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",
            color:P.stone,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({label, children}) {
  return (
    <div style={{marginBottom:12}}>
      {label && <div style={{fontSize:10,color:P.stone,fontFamily:FM,
        letterSpacing:.5,marginBottom:5}}>{label}</div>}
      {children}
    </div>
  );
}

const inputStyle = {width:"100%",background:P.bg,border:`1px solid ${P.pebble}`,
  borderRadius:R,padding:"9px 13px",fontSize:14,color:P.ink};

// ── Ride card ─────────────────────────────────────────────────────────────────
function Card({r, onClick}) {
  return (
    <div onClick={onClick} style={{
      background:P.paper, borderRadius:R+2, padding:"16px 18px", cursor:"pointer",
      borderLeft:`3px solid ${r.urgent?P.bark:r.pro?P.bark:P.sageL}`,
      marginBottom:10, transition:"transform .12s",
    }}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
      onMouseLeave={e=>e.currentTarget.style.transform="none"}>

      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"flex-start",marginBottom:10}}>
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <Av av={r.av} live={r.live} pro={r.pro} stu={r.stu}/>
          <div>
            <div style={{fontWeight:500,fontSize:14}}>{r.drv}</div>
            <div style={{fontSize:11,color:P.stone,marginTop:1,display:"flex",gap:5,flexWrap:"wrap"}}>
              {r.live && <span style={{color:P.sage}}>● live</span>}
              {!r.live && <span>upcoming</span>}
              {r.rec && <span style={{color:P.pebble}}>· recurring</span>}
              {r.urgent && <span style={{color:P.bark,fontWeight:500}}>· needs a hand</span>}
              {r.km>=30 && <span style={{color:P.bark}}>· regional</span>}
            </div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:19,fontWeight:600,fontFamily:FD,
            color:costColor(r)}}>{costLabel(r)}</div>
          <div style={{fontSize:10,color:P.stone,marginTop:1}}>{costSub(r)}</div>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9,fontSize:14}}>
        <span style={{fontWeight:500}}>{r.fr}</span>
        <span style={{color:P.pebble}}>→</span>
        <span style={{fontWeight:500}}>{r.to}</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:11,color:P.stone,display:"flex",gap:10}}>
          <span>{r.t}</span>
          <span>{r.s} seat{r.s!==1?"s":""}</span>
          <span>~{r.km}km</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <Stars v={r.pr} size={10}/>
          <span style={{fontSize:11,color:P.stone}}>{r.pr}</span>
        </div>
      </div>

      {r.music && (
        <div style={{marginTop:9,paddingTop:9,borderTop:`1px solid ${P.pebble}22`,
          fontSize:11,color:P.stone}}>
          ♪ {r.music}
        </div>
      )}
    </div>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function Detail({r, onClose, onBook, onRate, onSafety}) {
  return (
    <Modal title={r.drv} onClose={onClose}>
      {r.urgent && (
        <div style={{background:P.barkL,borderRadius:R,padding:"10px 14px",
          marginBottom:14,fontSize:13,color:P.bark,fontWeight:500}}>
          🙏 Someone needs a hand — can you help?
        </div>
      )}
      <div style={{color:P.stone,fontSize:13,marginBottom:16}}>{r.fr} → {r.to}</div>

      <div style={{background:P.sageL,borderRadius:R,padding:"12px 16px",
        marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:P.stone,fontFamily:FM,marginBottom:3}}>
            {r.cost==="free"?"NO COST":r.cost==="split"?"FUEL SPLIT":"FIXED"}
          </div>
          <div style={{fontSize:24,fontWeight:600,fontFamily:FD,color:costColor(r)}}>
            {costLabel(r)}
          </div>
        </div>
        <span style={{fontSize:28}}>{r.cost==="free"?"🌿":"⛽"}</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[["Time",r.t],["Seats free",r.s],["Distance",`~${r.km}km`],
          ["Status",r.live?"Live now":"Upcoming"]].map(([k,v])=>(
          <div key={k} style={{background:P.bg,borderRadius:R,padding:"9px 13px"}}>
            <div style={{fontSize:9,color:P.pebble,fontFamily:FM,marginBottom:2}}>{k.toUpperCase()}</div>
            <div style={{fontWeight:500,fontSize:14}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["Passenger",r.pr],["Vehicle",r.vr]].map(([l,v])=>(
          <div key={l} style={{flex:1,background:P.bg,borderRadius:R,
            padding:"9px 13px",textAlign:"center"}}>
            <div style={{fontSize:9,color:P.pebble,fontFamily:FM,marginBottom:3}}>
              {l.toUpperCase()}
            </div>
            <div style={{fontSize:17,fontWeight:600,color:P.straw,marginBottom:2}}>{v}</div>
            <Stars v={v} size={10}/>
          </div>
        ))}
      </div>

      {r.rec && r.days.length>0 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:P.stone,fontFamily:FM,marginBottom:6}}>RECURRING DAYS</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>(
              <span key={d} style={{padding:"3px 7px",borderRadius:5,fontSize:10,fontFamily:FM,
                background:r.days.includes(d)?P.sageL:P.bg,
                color:r.days.includes(d)?P.sage:P.pebble}}>{d}</span>
            ))}
          </div>
        </div>
      )}

      {r.music && (
        <div style={{background:P.bg,borderRadius:R,padding:"10px 14px",
          marginBottom:14,fontSize:12,color:P.stone}}>
          ♪ {r.music}
        </div>
      )}

      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        <Btn outline small onClick={()=>onSafety(r)}>🛡 Safety</Btn>
        <Btn outline small onClick={()=>onRate(r)}>★ Rate</Btn>
        <Btn onClick={()=>onBook(r)} color={r.urgent?P.bark:r.cost==="free"?P.sage:P.sage}
          style={{flex:1}}>
          {r.urgent?"Help out 🙏":r.cost==="free"?"Claim free seat":"Book seat"}
        </Btn>
      </div>
    </Modal>
  );
}

// ── Post modal ────────────────────────────────────────────────────────────────
function PostModal({onClose, onPost, isPro}) {
  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const GENRES = ["Pop","Hip-Hop","R&B","Rock","Indie","Country","Electronic","90s","K-Pop","Podcasts","Silence 🤫"];
  const [fr,setFr]=useState(""); const [to,setTo]=useState("");
  const [time,setTime]=useState(""); const [seats,setSeats]=useState(1);
  const [cost,setCost]=useState("free"); const [amt,setAmt]=useState("");
  const [rec,setRec]=useState(false); const [rdays,setRdays]=useState([]);
  const [genres,setGenres]=useState([]); const [aux,setAux]=useState(false);
  const [note,setNote]=useState("");
  const ok = fr&&to&&time&&(cost==="free"||amt);
  const toggleDay = d => setRdays(s=>s.includes(d)?s.filter(x=>x!==d):[...s,d]);
  const toggleGenre = g => setGenres(s=>s.includes(g)?s.filter(x=>x!==g):[...s,g]);

  return (
    <Modal title="Post a ride" onClose={onClose}>
      {isPro && (
        <div style={{background:P.sageL,borderRadius:R,padding:"8px 12px",
          fontSize:12,color:P.sage,marginBottom:14}}>
          ✦ Pro — shown at the top of results
        </div>
      )}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input placeholder="From…" value={fr} onChange={e=>setFr(e.target.value)}
          style={{...inputStyle,flex:1}}/>
        <input placeholder="To…" value={to} onChange={e=>setTo(e.target.value)}
          style={{...inputStyle,flex:1}}/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input type="time" value={time} onChange={e=>setTime(e.target.value)}
          style={{...inputStyle,flex:2}}/>
        <select value={seats} onChange={e=>setSeats(+e.target.value)}
          style={{...inputStyle,flex:1}}>
          {[1,2,3,4].map(n=><option key={n}>{n}</option>)}
        </select>
      </div>

      <Field label="COST">
        <div style={{display:"flex",gap:6,marginBottom:cost!=="free"?10:0}}>
          {[["free","🌿 Free"],["split","⛽ Split"],["fixed","💵 Fixed"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setCost(v);setAmt("");}} style={{
              flex:1,padding:"8px 0",borderRadius:R,fontSize:12,fontWeight:500,
              border:`1.5px solid ${cost===v?P.sage:P.pebble}`,
              background:cost===v?P.sageL:"transparent",
              color:cost===v?P.sage:P.stone,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>
        {cost!=="free" && (
          <input type="number" placeholder="Amount ($)" value={amt}
            onChange={e=>setAmt(e.target.value)} style={inputStyle}/>
        )}
        {cost==="free" && (
          <div style={{fontSize:12,color:P.sage,padding:"6px 0"}}>
            🌿 Free rides make a real difference. Thank you.
          </div>
        )}
      </Field>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        background:P.bg,borderRadius:R,padding:"9px 13px",marginBottom:rec?8:12}}>
        <span style={{fontSize:13,fontWeight:500}}>Recurring ride</span>
        <button onClick={()=>setRec(r=>!r)} style={{
          width:36,height:19,borderRadius:99,border:"none",cursor:"pointer",
          background:rec?P.sage:P.pebble,position:"relative",transition:"background .2s"}}>
          <div style={{position:"absolute",top:2,width:15,height:15,borderRadius:"50%",
            background:"#fff",left:rec?"19px":"2px",transition:"left .2s"}}/>
        </button>
      </div>
      {rec && (
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
          {DAYS.map(d=>(
            <button key={d} onClick={()=>toggleDay(d)} style={{
              padding:"4px 8px",borderRadius:5,fontSize:11,fontFamily:FM,cursor:"pointer",
              border:`1.5px solid ${rdays.includes(d)?P.sage:P.pebble}`,
              background:rdays.includes(d)?P.sageL:"transparent",
              color:rdays.includes(d)?P.sage:P.stone}}>
              {d}
            </button>
          ))}
        </div>
      )}

      <Field label="MUSIC VIBE (optional)">
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:7}}>
          <span style={{fontSize:12,color:P.stone}}>Passenger gets aux?</span>
          <button onClick={()=>setAux(a=>!a)} style={{
            width:34,height:18,borderRadius:99,border:"none",cursor:"pointer",
            background:aux?P.sage:P.pebble,position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:2,width:14,height:14,borderRadius:"50%",
              background:"#fff",left:aux?"18px":"2px",transition:"left .2s"}}/>
          </button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:7}}>
          {GENRES.map(g=>(
            <button key={g} onClick={()=>toggleGenre(g)} style={{
              padding:"2px 8px",borderRadius:99,fontSize:11,cursor:"pointer",
              border:`1px solid ${genres.includes(g)?P.sage:P.pebble}`,
              background:genres.includes(g)?P.sageL:"transparent",
              color:genres.includes(g)?P.sage:P.stone}}>
              {g}
            </button>
          ))}
        </div>
        <input placeholder='In your own words…' value={note}
          onChange={e=>setNote(e.target.value)} style={inputStyle}/>
      </Field>

      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn disabled={!ok} onClick={()=>{
          const musicStr = [aux?"Passenger aux 🎤":"", ...genres, note].filter(Boolean).join(" · ");
          onPost({fr,to,time,seats,cost,amt,rec,rdays,music:musicStr});
        }} style={{flex:1}}>Go live 🌿</Btn>
      </div>
    </Modal>
  );
}

// ── Rate modal ────────────────────────────────────────────────────────────────
function RateModal({r, onClose, onSubmit}) {
  const [p,setP]=useState(0); const [v,setV]=useState(0); const [c,setC]=useState("");
  return (
    <Modal title="Rate your ride" onClose={onClose}>
      <p style={{fontSize:13,color:P.stone,marginBottom:18}}>
        {r.drv} · {r.fr} → {r.to}
      </p>
      {[["PASSENGER",p,setP],["VEHICLE",v,setV]].map(([l,val,set])=>(
        <Field key={l} label={l}>
          <div style={{display:"flex",gap:8,marginBottom:4}}>
            {[1,2,3,4,5].map(i=>(
              <button key={i} onClick={()=>set(i)} style={{
                fontSize:22,background:"none",border:"none",cursor:"pointer",
                color:val>=i?P.straw:P.pebble}}>★</button>
            ))}
          </div>
        </Field>
      ))}
      <textarea placeholder="Comment (optional)" value={c} onChange={e=>setC(e.target.value)}
        style={{...inputStyle,height:64,resize:"none",marginBottom:14}}/>
      <div style={{display:"flex",gap:8}}>
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn onClick={()=>onSubmit(r.id,p,v,c)} style={{flex:1}}>Submit</Btn>
      </div>
    </Modal>
  );
}

// ── Safety modal ──────────────────────────────────────────────────────────────
function SafetyModal({r, onClose}) {
  const [contact,setContact]=useState(""); const [sent,setSent]=useState(false);
  return (
    <Modal title="🛡 Trip safety" onClose={onClose}>
      <div style={{background:P.bg,borderRadius:R,padding:"9px 13px",
        marginBottom:16,fontSize:13}}>
        <div style={{fontWeight:500}}>{r?.fr} → {r?.to}</div>
        <div style={{color:P.stone,marginTop:1}}>{r?.drv} · {r?.t}</div>
      </div>
      <Field label="SHARE YOUR TRIP">
        <input placeholder="Phone or email…" value={contact}
          onChange={e=>setContact(e.target.value)} style={{...inputStyle,marginBottom:8}}/>
        <Btn disabled={!contact} onClick={()=>setSent(true)} fullWidth>
          {sent?"✓ Tracking link sent":"Send tracking link"}
        </Btn>
        {sent && (
          <div style={{fontSize:12,color:P.sage,marginTop:8}}>
            📍 They'll see your location until you arrive safely.
          </div>
        )}
      </Field>
      <div style={{background:P.sageL,borderRadius:R,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontWeight:500,fontSize:13,color:P.sage,marginBottom:8}}>
          Before you get in
        </div>
        {["Name matches the app","Number plate looks right",
          "Sit in the back if alone","Trust your gut — always ok to cancel"
        ].map(t=>(
          <div key={t} style={{display:"flex",gap:7,fontSize:12,
            color:P.ink,marginBottom:5}}>
            <span style={{color:P.sage}}>✓</span>{t}
          </div>
        ))}
      </div>
      <Btn outline onClick={onClose} fullWidth>All good, let's go</Btn>
    </Modal>
  );
}

// ── Urgent modal ──────────────────────────────────────────────────────────────
function UrgentModal({onClose, onPost}) {
  const [fr,setFr]=useState(""); const [to,setTo]=useState(""); const [note,setNote]=useState("");
  return (
    <Modal title="Need a ride?" onClose={onClose}>
      <p style={{fontSize:13,color:P.stone,marginBottom:16,lineHeight:1.6}}>
        Let nearby drivers know. These rides are always free.
      </p>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input placeholder="I'm at…" value={fr} onChange={e=>setFr(e.target.value)}
          style={{...inputStyle,flex:1}}/>
        <input placeholder="Need to get to…" value={to} onChange={e=>setTo(e.target.value)}
          style={{...inputStyle,flex:1}}/>
      </div>
      <input placeholder="What happened? (optional)" value={note}
        onChange={e=>setNote(e.target.value)} style={{...inputStyle,marginBottom:12}}/>
      <div style={{background:P.sageL,borderRadius:R,padding:"9px 13px",
        fontSize:12,color:P.sage,marginBottom:14}}>
        🙏 Nearby drivers will be notified. Most respond within minutes.
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn disabled={!fr||!to} onClick={()=>onPost(fr,to,note)} style={{flex:1}}>
          Send request 🙏
        </Btn>
      </div>
    </Modal>
  );
}

// ── Student modal ─────────────────────────────────────────────────────────────
function StudentModal({onClose, onVerify}) {
  const [email,setEmail]=useState(""); const [done,setDone]=useState(false);
  const ok = email.includes(".ac.nz")||email.includes(".edu");
  if(done) return (
    <Modal title="🎓 Verified!" onClose={onClose}>
      <div style={{textAlign:"center",padding:"10px 0 6px"}}>
        <div style={{fontSize:44,marginBottom:10}}>🎓</div>
        <p style={{color:P.stone,fontSize:13,marginBottom:18}}>
          Your student badge is live on your profile.
        </p>
        <Btn onClick={()=>{onVerify();onClose();}} fullWidth>Done</Btn>
      </div>
    </Modal>
  );
  return (
    <Modal title="🎓 Student verification" onClose={onClose}>
      <p style={{fontSize:13,color:P.stone,marginBottom:14,lineHeight:1.6}}>
        Verify with your university email to get a student badge.
      </p>
      <input type="email" placeholder="you@student.ac.nz" value={email}
        onChange={e=>setEmail(e.target.value)}
        style={{...inputStyle,borderColor:ok?P.sage:P.pebble,marginBottom:14}}/>
      <div style={{display:"flex",gap:8}}>
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn disabled={!ok} onClick={()=>setDone(true)} style={{flex:1}}>Verify</Btn>
      </div>
    </Modal>
  );
}

// ── CO2 tab ───────────────────────────────────────────────────────────────────
function ImpactTab({booked}) {
  const km    = booked.reduce((a,r)=>a+(r.km||0),0);
  const saved = +(km*0.21*0.6).toFixed(1);
  const trees = +(saved/6).toFixed(1);
  const pct   = Math.min(100,(saved/100)*100);
  return (
    <div style={{animation:"up .4s"}}>
      <h2 style={{fontFamily:FD,fontSize:22,fontWeight:600,marginBottom:4}}>Your impact</h2>
      <p style={{color:P.stone,marginBottom:20}}>Every shared ride removes a car from the road.</p>
      <div style={{background:P.sage,borderRadius:R+4,padding:26,marginBottom:14,
        color:"#fff",textAlign:"center"}}>
        <div style={{fontSize:10,fontFamily:FM,letterSpacing:1,opacity:.8,marginBottom:8}}>
          CO₂ AVOIDED
        </div>
        <div style={{fontFamily:FD,fontSize:48,fontWeight:600,lineHeight:1}}>
          {saved}
          <span style={{fontSize:20,fontWeight:400,opacity:.7}}> kg</span>
        </div>
        <div style={{fontSize:12,opacity:.7,marginTop:4}}>
          across {booked.length} ride{booked.length!==1?"s":""}
        </div>
        <div style={{marginTop:18,background:"rgba(255,255,255,.2)",borderRadius:99,height:4}}>
          <div style={{width:pct+"%",height:"100%",background:"#fff",borderRadius:99,
            minWidth:pct>0?"4px":"0"}}/>
        </div>
        <div style={{fontSize:10,opacity:.6,marginTop:4}}>{saved} of 100kg milestone</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[["🌳",trees,"trees equiv."],["📍",km,"km shared"]].map(([e,v,l])=>(
          <div key={l} style={{background:P.paper,borderRadius:R,padding:16,
            textAlign:"center",border:`1px solid ${P.pebble}22`}}>
            <div style={{fontSize:26,marginBottom:5}}>{e}</div>
            <div style={{fontFamily:FD,fontSize:20,fontWeight:600,color:P.sage}}>{v}</div>
            <div style={{fontSize:11,color:P.stone,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:P.sageL,borderRadius:R,padding:"13px 16px"}}>
        <div style={{fontWeight:500,fontSize:13,color:P.sage,marginBottom:5}}>Share</div>
        <p style={{fontSize:12,color:P.stone,marginBottom:10}}>
          "I've avoided {saved}kg of CO₂ carpooling with RideShare NZ 🌿"
        </p>
        <Btn outline small>Copy</Btn>
      </div>
      {booked.length===0 && (
        <p style={{textAlign:"center",color:P.stone,fontSize:13,marginTop:16}}>
          Book your first ride to start tracking 🌱
        </p>
      )}
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({sub, wallet, isStu, booked, onUpgrade, onStudent, onTopUp}) {
  const isPro   = sub==="pro";
  const isPerks = sub==="perks";
  return (
    <div style={{animation:"up .4s"}}>
      <h2 style={{fontFamily:FD,fontSize:22,fontWeight:600,marginBottom:18}}>Profile</h2>
      <div style={{background:P.sage,borderRadius:R+4,padding:20,marginBottom:14,
        color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,fontFamily:FM,letterSpacing:1,opacity:.8,marginBottom:4}}>
            WALLET
          </div>
          <div style={{fontFamily:FD,fontSize:30,fontWeight:600}}>${wallet.toFixed(2)}</div>
        </div>
        <button onClick={onTopUp} style={{padding:"6px 14px",borderRadius:R,fontSize:12,
          fontWeight:500,background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.4)",
          color:"#fff",cursor:"pointer"}}>
          + Top up
        </button>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        {isPro   && <Pill label="✦ Pro Driver"/>}
        {isPerks && <Pill label="♦ Passenger Perks"/>}
        {isStu   && <Pill label="🎓 Student"/>}
        {!isPro&&!isPerks&&!isStu && <span style={{fontSize:13,color:P.stone}}>Free plan</span>}
      </div>

      {[
        !isStu  && {label:"🎓 Verify as student",  sub:"Badge + student ride pools",        fn:onStudent},
        !isPro  && {label:"✦ Pro Driver · $7.99/mo", sub:"Priority listing + verified badge", fn:()=>onUpgrade("pro")},
        !isPerks&& {label:"♦ Passenger Perks · $4.99/mo",sub:"Early access + priority booking",fn:()=>onUpgrade("perks")},
      ].filter(Boolean).map(item=>(
        <button key={item.label} onClick={item.fn} style={{
          width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
          background:P.paper,border:`1px solid ${P.pebble}22`,borderRadius:R,
          padding:"13px 16px",cursor:"pointer",marginBottom:8,textAlign:"left"}}>
          <div>
            <div style={{fontWeight:500,fontSize:14}}>{item.label}</div>
            <div style={{fontSize:12,color:P.stone,marginTop:2}}>{item.sub}</div>
          </div>
          <span style={{color:P.pebble,fontSize:16}}>›</span>
        </button>
      ))}

      <div style={{marginTop:18}}>
        <div style={{fontSize:10,color:P.stone,fontFamily:FM,letterSpacing:.5,marginBottom:8}}>
          YOUR STATS
        </div>
        <div style={{background:P.paper,borderRadius:R,border:`1px solid ${P.pebble}22`,overflow:"hidden"}}>
          {[
            ["Rides booked",       booked.length],
            ["Recurring bookings", booked.filter(r=>r.recurDay).length],
            ["CO₂ avoided",        `~${(booked.reduce((a,r)=>a+(r.km||0),0)*0.21*0.6).toFixed(1)} kg`],
            ["Wallet balance",     `$${wallet.toFixed(2)}`],
          ].map(([k,v],i,arr)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",
              padding:"11px 15px",fontSize:13,
              borderBottom:i<arr.length-1?`1px solid ${P.pebble}22`:"none"}}>
              <span style={{color:P.stone}}>{k}</span>
              <span style={{fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {const [session, setSession] = useState(null);
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authMode, setAuthMode] = useState("login");
const [authLoading, setAuthLoading] = useState(false);

useEffect(()=>{
  supabase.auth.getSession().then(({data:{session}})=>setSession(session));
  supabase.auth.onAuthStateChange((_,session)=>setSession(session));
},[]);

const handleAuth = async () => {
  setAuthLoading(true);
  if(authMode==="login"){
    const {error} = await supabase.auth.signInWithPassword({email:authEmail,password:authPassword});
    if(error) alert(error.message);
  } else {
    const {error} = await supabase.auth.signUp({email:authEmail,password:authPassword});
    if(error) alert(error.message);
    else alert("Check your email to confirm your account!");
  }
  setAuthLoading(false);
};

if(!session) return (
  <>
    <style>{CSS}</style>
    <div style={{minHeight:"100vh",background:P.bg,display:"flex",
      alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:P.paper,borderRadius:R+4,padding:32,width:340}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:32,marginBottom:8}}>🌿</div>
          <h1 style={{fontFamily:FD,fontSize:24,fontWeight:600,marginBottom:4}}>Haerenga</h1>
          <p style={{color:P.stone,fontSize:13}}>Community carpooling for Aotearoa</p>
        </div>
        <div style={{marginBottom:12}}>
          <input type="email" placeholder="Email address" value={authEmail}
            onChange={e=>setAuthEmail(e.target.value)}
            style={{...inputStyle,marginBottom:8}}/>
          <input type="password" placeholder="Password" value={authPassword}
            onChange={e=>setAuthPassword(e.target.value)}
            style={inputStyle}/>
        </div>
        <button onClick={handleAuth} disabled={authLoading||!authEmail||!authPassword}
          style={{width:"100%",padding:"11px 0",borderRadius:R,border:"none",
            background:P.sage,color:"#fff",fontSize:14,fontWeight:600,
            cursor:"pointer",marginBottom:12,opacity:authLoading?.7:1}}>
          {authLoading?"Please wait...":(authMode==="login"?"Sign in":"Create account")}
        </button>
        <div style={{textAlign:"center",fontSize:13,color:P.stone}}>
          {authMode==="login"?"Don't have an account? ":"Already have an account? "}
          <span onClick={()=>setAuthMode(m=>m==="login"?"signup":"login")}
            style={{color:P.sage,cursor:"pointer",fontWeight:500}}>
            {authMode==="login"?"Sign up":"Sign in"}
          </span>
        </div>
      </div>
    </div>
  </>
);  
  const [rides,    setRides]   = useState(RIDES);
  const [urgent,   setUrgent]  = useState(URGENT_SEED);
  const [tab,      setTab]     = useState("find");
  const [detail,   setDetail]  = useState(null);
  const [rateTgt,  setRateTgt] = useState(null);
  const [safety,   setSafety]  = useState(null);
  const [showPost, setPost]    = useState(false);
  const [showUrg,  setUrg]     = useState(false);
  const [showStu,  setStu]     = useState(false);
  const [search,   setSearch]  = useState({fr:"",to:""});
  const [costF,    setCostF]   = useState("all");
  const [booked,   setBooked]  = useState([]);
  const [sub,      setSub]     = useState("free");
  const [wallet,   setWallet]  = useState(12.50);
  const [isStu,    setStuV]    = useState(false);
  const [toast,    setToast]   = useState(null);
  // Business state
  const [bizPlan,  setBizPlan]  = useState(null); // null | "starter" | "growth" | "enterprise"
  const [bizBilling, setBizBilling] = useState("monthly");
  const [bizTab,   setBizTab]  = useState("overview"); // overview | team | esg | billing

  const notify = msg => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{
    const t = setTimeout(()=>{
      setRides(r=>[{id:99,drv:"Dana Lee",av:"DL",fr:"Mt Eden",to:"Britomart",
        t:"Now",s:2,cost:"free",pp:0,pr:4.6,vr:4.3,live:true,km:5,
        pro:false,rec:false,days:[],stu:true,music:"Passenger aux 🎤 · Indie"},...r]);
      notify("🌿 Dana posted a free ride: Mt Eden → Britomart");
    },14000);
    return()=>clearTimeout(t);
  },[]);

  const all = [...urgent,...rides].sort((a,b)=>{
    if(a.urgent&&!b.urgent)return -1;
    if(!a.urgent&&b.urgent)return 1;
    if(b.pro&&!a.pro)return 1;
    if(a.pro&&!b.pro)return -1;
    return 0;
  });

  const filtered = all.filter(r=>{
    if(r.urgent) return true;
    const ff = search.fr ? r.fr.toLowerCase().includes(search.fr.toLowerCase()) : true;
    const ft = search.to ? r.to.toLowerCase().includes(search.to.toLowerCase()) : true;
    const fc = costF==="all" ? true : r.cost===costF;
    return ff&&ft&&fc;
  });

  const freeCount = rides.filter(r=>r.cost==="free").length;

  const handleBook = r => {
    setBooked(b=>[...b,r]);
    setRides(rs=>rs.map(x=>x.id===r.id?{...x,s:Math.max(0,x.s-1)}:x));
    setUrgent(u=>u.filter(x=>x.id!==r.id));
    setDetail(null);
    notify(r.urgent?"🙏 Helping someone out — legend!":r.cost==="free"?"🌿 Free seat claimed!":"✓ Booked!");
  };

  const handleRate = (id,p,v,c) => {
    if(!p&&!v){notify("Please tap a star");return;}
    setRides(rs=>rs.map(r=>r.id!==id?r:{...r,
      pr:p?+((r.pr*3+p)/4).toFixed(1):r.pr,
      vr:v?+((r.vr*3+v)/4).toFixed(1):r.vr}));
    setRateTgt(null); setDetail(null);
    notify("★ Rating submitted");
  };

  const handlePost = f => {
    setRides(r=>[{id:Date.now(),drv:"You",av:"ME",fr:f.fr,to:f.to,
      t:f.time,s:parseInt(f.seats),cost:f.cost,
      pp:f.cost==="free"?0:parseFloat(f.amt),
      pr:5,vr:5,live:true,km:0,pro:sub==="pro",
      rec:f.rec,days:f.rdays,stu:isStu,music:f.music},...r]);
    setPost(false);
    notify(f.cost==="free"?"🌿 Free ride posted!":"✓ Your ride is live");
  };

  const handleUrgent = (fr,to) => {
    setUrgent(u=>[{id:Date.now(),drv:"You",av:"ME",fr,to,t:"ASAP",
      s:1,cost:"free",pp:0,pr:5,vr:5,live:true,km:0,
      pro:false,rec:false,days:[],stu:isStu,music:"",urgent:true},...u]);
    setUrg(false);
    notify("🙏 Request sent to nearby drivers");
  };

  const TABS = [
    {id:"find",    label:"Find"},
    {id:"impact",  label:"Impact"},
    {id:"booked",  label:booked.length?`Booked · ${booked.length}`:"Booked"},
    {id:"profile", label:"Profile"},
    {id:"business",   label:"🏢 Business"},
  ];

  return (
    <>
      <style>{CSS}</style>

      <header style={{background:P.paper,borderBottom:`1px solid ${P.pebble}33`,
        position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:tab==="business"?980:560,margin:"0 auto",padding:"13px 18px",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,background:P.sageL,borderRadius:7,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
              🌿
            </div>
            <div>
              <div style={{fontFamily:FD,fontWeight:600,fontSize:16,letterSpacing:-.3}}>
                RideShare
              </div>
              <div style={{fontSize:9,color:P.stone,fontFamily:FM,letterSpacing:.8}}>
                NZ · COMMUNITY
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <Btn outline small onClick={()=>setUrg(true)}>🙏 Need help?</Btn>
            <Btn outline small onClick={()=>supabase.auth.signOut()}>Sign out</Btn>
            <Btn small onClick={()=>setPost(true)}>+ Post</Btn>
          </div>
        </div>
        <div style={{maxWidth:tab==="business"?980:560,margin:"0 auto",display:"flex",
          borderTop:`1px solid ${P.pebble}22`}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"9px 4px",border:"none",background:"transparent",
              fontSize:12,fontWeight:tab===t.id?600:400,cursor:"pointer",
              color:tab===t.id?P.sage:P.stone,
              borderBottom:`2px solid ${tab===t.id?P.sage:"transparent"}`,
              transition:"all .15s"}}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main style={{maxWidth:tab==="business"?980:560,margin:"0 auto",padding:tab==="business"?"0":"18px 18px 48px"}}>

        {tab==="find" && (
          <div style={{animation:"up .3s"}}>
            {urgent.length>0 && (
              <div onClick={()=>setDetail(urgent[0])} style={{
                background:P.barkL,borderRadius:R+2,padding:"13px 16px",
                marginBottom:14,cursor:"pointer",borderLeft:`3px solid ${P.bark}`,
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:500,fontSize:14,color:P.bark}}>
                    🙏 Someone needs a lift
                  </div>
                  <div style={{fontSize:12,color:P.stone,marginTop:2}}>
                    {urgent[0].fr} → {urgent[0].to} · Can you help?
                  </div>
                </div>
                <span style={{color:P.bark,fontSize:18}}>›</span>
              </div>
            )}

            {freeCount>0 && (
              <div style={{background:P.sageL,borderRadius:R+2,padding:"11px 16px",
                marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:500,fontSize:13,color:P.sage}}>
                    {freeCount} free ride{freeCount!==1?"s":""} right now
                  </div>
                  <div style={{fontSize:11,color:P.stone,marginTop:1}}>
                    Generous community drivers
                  </div>
                </div>
                <button onClick={()=>setCostF(c=>c==="free"?"all":"free")} style={{
                  padding:"4px 11px",borderRadius:99,border:"none",fontSize:11,
                  background:costF==="free"?P.sage:"rgba(0,0,0,.08)",
                  color:costF==="free"?"#fff":P.stone,cursor:"pointer",fontWeight:500}}>
                  {costF==="free"?"All":"View"}
                </button>
              </div>
            )}

            <div style={{display:"flex",gap:7,marginBottom:9}}>
              <input placeholder="From…" value={search.fr}
                onChange={e=>setSearch(s=>({...s,fr:e.target.value}))}
                style={{...inputStyle,flex:1}}/>
              <input placeholder="To…" value={search.to}
                onChange={e=>setSearch(s=>({...s,to:e.target.value}))}
                style={{...inputStyle,flex:1}}/>
            </div>

            <div style={{display:"flex",gap:5,marginBottom:18}}>
              {[["all","All"],["free","🌿 Free"],["split","Split"],["fixed","Fixed"]].map(([v,l])=>(
                <button key={v} onClick={()=>setCostF(v)} style={{
                  padding:"5px 11px",borderRadius:99,fontSize:11,fontWeight:500,cursor:"pointer",
                  border:`1px solid ${costF===v?P.sage:P.pebble}`,
                  background:costF===v?P.sageL:"transparent",
                  color:costF===v?P.sage:P.stone}}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{display:"flex",gap:7,marginBottom:18}}>
              {[["Live",rides.filter(r=>r.live).length],
                ["Free",freeCount],
                ["Seats",rides.reduce((a,r)=>a+r.s,0)]
              ].map(([k,v])=>(
                <div key={k} style={{flex:1,background:P.paper,borderRadius:R,
                  padding:"11px 12px",textAlign:"center",border:`1px solid ${P.pebble}22`}}>
                  <div style={{fontFamily:FD,fontSize:20,fontWeight:600,color:P.sage}}>{v}</div>
                  <div style={{fontSize:10,color:P.stone,marginTop:2}}>{k}</div>
                </div>
              ))}
            </div>

            {filtered.length===0 && (
              <p style={{textAlign:"center",color:P.stone,padding:40}}>
                No rides match. Try adjusting your search.
              </p>
            )}
            {filtered.map((r,i)=>(
              <Card key={r.id} r={r} onClick={()=>setDetail(r)}/>
            ))}
          </div>
        )}

        {tab==="impact"  && <ImpactTab booked={booked}/>}

        {tab==="booked" && (
          <div style={{animation:"up .3s"}}>
            <h2 style={{fontFamily:FD,fontSize:22,fontWeight:600,marginBottom:18}}>
              Your rides
            </h2>
            {booked.length===0 && (
              <p style={{textAlign:"center",color:P.stone,padding:40}}>
                No rides yet.{" "}
                <span style={{color:P.sage,cursor:"pointer"}}
                  onClick={()=>setTab("find")}>Browse →</span>
              </p>
            )}
            {booked.map((r,i)=>(
              <div key={r.id+"_"+i} style={{background:P.paper,borderRadius:R+2,
                padding:"13px 16px",marginBottom:9,
                display:"flex",justifyContent:"space-between",alignItems:"center",
                border:`1px solid ${P.pebble}22`}}>
                <div style={{display:"flex",gap:9,alignItems:"center"}}>
                  <Av av={r.av} size={32}/>
                  <div>
                    <div style={{fontWeight:500,fontSize:13}}>{r.fr} → {r.to}</div>
                    <div style={{fontSize:11,color:P.stone,marginTop:1}}>
                      {r.drv} · {r.recurDay?`Every ${r.recurDay}`:r.t} ·{" "}
                      <span style={{color:costColor(r)}}>{costLabel(r)}</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  <Btn outline small onClick={()=>setSafety(r)}>🛡</Btn>
                  <Btn outline small onClick={()=>{setDetail(r);setRateTgt(r);}}>★</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="profile" && (
          <ProfileTab sub={sub} wallet={wallet} isStu={isStu} booked={booked}
            onUpgrade={p=>{setSub(p);notify(`✦ ${p==="pro"?"Pro Driver":"Passenger Perks"} activated`);}}
            onStudent={()=>setStu(true)}
            onTopUp={()=>{setWallet(w=>+(w+20).toFixed(2));notify("👛 $20 added to wallet");}}
          />
        )}

        {tab==="business" && (
          <div style={{display:"flex",minHeight:"calc(100vh - 90px)"}}>

            {/* Business sidebar — only shown when plan active */}
            {bizPlan && (
              <div style={{width:200,background:P.paper,borderRight:`1px solid ${P.pebble}33`,
                padding:"24px 14px",display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
                <div style={{fontSize:10,color:P.stone,fontFamily:FM,letterSpacing:.8,
                  marginBottom:14,paddingLeft:4}}>BUSINESS DASHBOARD</div>
                {[
                  {id:"overview", label:"📊 Overview"},
                  {id:"team",     label:"👥 Team"},
                  {id:"esg",      label:"🌿 ESG Impact"},
                  {id:"billing",  label:"💳 Billing"},
                ].map(t=>(
                  <button key={t.id} onClick={()=>setBizTab(t.id)} style={{
                    padding:"9px 12px",borderRadius:R,border:"none",
                    background:bizTab===t.id?P.sageL:"transparent",
                    color:bizTab===t.id?P.sage:P.stone,
                    fontSize:13,fontWeight:bizTab===t.id?600:400,
                    textAlign:"left",cursor:"pointer",transition:"all .15s"}}>
                    {t.label}
                  </button>
                ))}
                <div style={{marginTop:"auto",background:P.bg,borderRadius:R,
                  padding:"12px 12px",border:`1px solid ${P.pebble}33`}}>
                  <div style={{fontSize:10,color:P.stone,fontFamily:FM,marginBottom:4}}>PLAN</div>
                  <div style={{fontWeight:600,fontSize:13,textTransform:"capitalize"}}>{bizPlan}</div>
                  <div style={{fontSize:11,color:P.stone,marginTop:2}}>Acme Corp NZ</div>
                  <button onClick={()=>setBizPlan(null)} style={{
                    marginTop:8,fontSize:10,color:P.pebble,background:"none",
                    border:"none",cursor:"pointer",padding:0}}>
                    Change plan
                  </button>
                </div>
              </div>
            )}

            {/* Business main content */}
            <div style={{flex:1,padding:"28px 32px",overflowY:"auto"}}>

              {/* ── Pricing gate ── */}
              {!bizPlan && (
                <div style={{animation:"up .4s"}}>
                  <div style={{textAlign:"center",marginBottom:36}}>
                    <div style={{display:"inline-block",background:P.sageL,color:P.sage,
                      borderRadius:99,padding:"4px 14px",fontSize:11,fontFamily:FM,
                      letterSpacing:.8,marginBottom:12}}>
                      RIDESHARE FOR BUSINESS · NZ PRICING
                    </div>
                    <h2 style={{fontFamily:FD,fontSize:28,fontWeight:600,marginBottom:10}}>
                      Choose your plan
                    </h2>
                    <p style={{color:P.stone,fontSize:14,marginBottom:20,maxWidth:500,margin:"0 auto 20px"}}>
                      Per-employee pricing that scales with your team. NZD, GST exclusive. Cancel any time.
                    </p>
                    <div style={{display:"inline-flex",background:P.bg,border:`1px solid ${P.pebble}`,
                      borderRadius:R,padding:3,gap:3}}>
                      {["monthly","annual"].map(b=>(
                        <button key={b} onClick={()=>setBizBilling(b)} style={{
                          padding:"7px 18px",borderRadius:R-2,border:"none",fontSize:13,fontWeight:500,
                          background:bizBilling===b?P.sage:"transparent",
                          color:bizBilling===b?"#fff":P.stone,transition:"all .2s",cursor:"pointer"}}>
                          {b==="monthly"?"Monthly":"Annual"}
                          {b==="annual"&&<span style={{marginLeft:6,fontSize:10,
                            color:bizBilling==="annual"?"#fff":P.sage}}> · save 20%</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan cards */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,marginBottom:28}}>
                    {[
                      {id:"starter",    name:"Starter",    emoji:"🌱", base:0,    perEmp:0,    onboard:0,
                       tag:null, features:["Up to 15 employees","Basic commuter map","Monthly summary email","Community support"],
                       cta:"Start free"},
                      {id:"growth",     name:"Growth",     emoji:"🚀", base:99,   perEmp:2.50, onboard:350,
                       tag:"Most popular", features:["Up to 200 employees","$2.50/employee/month","Live dashboard & analytics","Quarterly ESG report PDF","Priority ride matching","Email & chat support"],
                       cta:"Start 14-day trial"},
                      {id:"enterprise", name:"Enterprise", emoji:"🏢", base:299,  perEmp:2.00, onboard:800,
                       tag:null, features:["Unlimited employees","$2.00/employee/month","Custom branded portal","Monthly ESG reports","NZX / B Corp pack","Dedicated account manager","SSO & API access"],
                       cta:"Book a demo"},
                    ].map((p,i)=>{
                      const price = bizBilling==="annual" ? Math.round(p.base*.8) : p.base;
                      const pe    = bizBilling==="annual" ? +(p.perEmp*.8).toFixed(2) : p.perEmp;
                      return (
                        <div key={p.id} style={{background:P.paper,borderRadius:R+4,padding:28,
                          border:`1.5px solid ${p.tag?P.sage:P.pebble}`,
                          position:"relative",
                          animation:`up .4s ${i*.1}s ease both`,
                          ...(p.tag?{boxShadow:`0 4px 20px ${P.sage}18`}:{})}}>
                          {p.tag && (
                            <div style={{position:"absolute",top:-11,left:"50%",
                              transform:"translateX(-50%)",background:P.sage,color:"#fff",
                              fontSize:10,fontWeight:600,padding:"3px 12px",borderRadius:99,
                              fontFamily:FM,letterSpacing:.6,whiteSpace:"nowrap"}}>
                              {p.tag}
                            </div>
                          )}
                          <div style={{fontSize:26,marginBottom:8}}>{p.emoji}</div>
                          <div style={{fontFamily:FD,fontSize:18,fontWeight:600,marginBottom:3}}>
                            {p.name}
                          </div>
                          <div style={{marginBottom:18}}>
                            {p.base===0 ? (
                              <div style={{fontFamily:FD,fontSize:28,fontWeight:600,color:P.sage}}>Free</div>
                            ) : (
                              <div>
                                <span style={{fontFamily:FD,fontSize:28,fontWeight:600,color:P.sage}}>
                                  ${price}
                                </span>
                                <span style={{fontSize:13,color:P.stone}}>/mo base</span>
                                <div style={{fontSize:12,color:P.stone,marginTop:2}}>
                                  + <strong style={{color:P.sage}}>${pe}</strong>/employee/mo
                                </div>
                                {p.onboard>0 && (
                                  <div style={{fontSize:11,color:P.pebble,marginTop:1}}>
                                    + ${p.onboard} one-off setup
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
                            {p.features.map(f=>(
                              <div key={f} style={{display:"flex",gap:7,fontSize:12}}>
                                <span style={{color:P.sage,flexShrink:0}}>✓</span>
                                <span style={{color:P.stone}}>{f}</span>
                              </div>
                            ))}
                          </div>
                          <button onClick={()=>{setBizPlan(p.id);setBizTab("overview");
                            notify(`🏢 ${p.name} plan activated!`);}} style={{
                            width:"100%",padding:"10px 0",borderRadius:R,
                            background:p.tag?P.sage:P.bg,
                            color:p.tag?"#fff":P.sage,
                            border:p.tag?"none":`1.5px solid ${P.sage}`,
                            fontSize:13,fontWeight:600,cursor:"pointer",transition:"opacity .15s"}}
                            onMouseEnter={e=>e.currentTarget.style.opacity=".8"}
                            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                            {p.cta}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Social proof */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",
                    background:P.paper,borderRadius:R+4,overflow:"hidden",
                    border:`1px solid ${P.pebble}33`,marginBottom:20}}>
                    {[["23","NZ companies","on the waitlist"],
                      ["$8.2k","avg annual saving","per 50-person team"],
                      ["100%","satisfaction","beta employers"]].map(([v,l,s],i,arr)=>(
                      <div key={l} style={{textAlign:"center",padding:"18px 16px",
                        borderRight:i<arr.length-1?`1px solid ${P.pebble}33`:"none"}}>
                        <div style={{fontFamily:FD,fontSize:24,fontWeight:600,color:P.sage}}>{v}</div>
                        <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{l}</div>
                        <div style={{fontSize:11,color:P.stone,fontFamily:FM}}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Overview ── */}
              {bizPlan && bizTab==="overview" && (
                <div style={{animation:"up .3s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"flex-start",marginBottom:28}}>
                    <div>
                      <h2 style={{fontFamily:FD,fontSize:22,fontWeight:600,marginBottom:3}}>
                        Good morning, Acme Corp 👋
                      </h2>
                      <div style={{fontSize:13,color:P.stone}}>
                        Q1 2025 · {bizPlan.charAt(0).toUpperCase()+bizPlan.slice(1)} plan
                      </div>
                    </div>
                    <button onClick={()=>setBizTab("esg")} style={{
                      display:"flex",alignItems:"center",gap:6,padding:"9px 16px",
                      borderRadius:R,border:"none",background:P.sage,color:"#fff",
                      fontSize:13,fontWeight:500,cursor:"pointer"}}>
                      🌿 ESG Report
                    </button>
                  </div>

                  {/* Stat cards */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
                    {[["🚗","96","Total rides","this quarter",P.sage],
                      ["🌿","8.9t","CO₂ avoided","vs solo driving",P.sage],
                      ["💰","$1,480","Team savings","combined fuel",P.bark],
                      ["👥","5/7","Active commuters","employees",P.sage],
                    ].map(([icon,val,label,sub,color])=>(
                      <div key={label} style={{background:P.paper,borderRadius:R+2,
                        padding:"18px 16px",borderTop:`3px solid ${color}`,
                        border:`1px solid ${P.pebble}22`}}>
                        <div style={{fontSize:20,marginBottom:8}}>{icon}</div>
                        <div style={{fontFamily:FD,fontSize:24,fontWeight:600,
                          color,marginBottom:2}}>{val}</div>
                        <div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{label}</div>
                        <div style={{fontSize:11,color:P.stone,fontFamily:FM}}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top corridors */}
                  <div style={{background:P.paper,borderRadius:R+2,padding:22,
                    border:`1px solid ${P.pebble}22`}}>
                    <div style={{fontSize:10,color:P.stone,fontFamily:FM,
                      letterSpacing:.8,marginBottom:16}}>TOP COMMUTE CORRIDORS</div>
                    {[["Newtown → CBD",82,96],["Parramatta → Olympic Pk",64,74],
                      ["Bondi → Surry Hills",55,63],["Hornsby → Macquarie",40,46],
                      ["Chatswood → N. Sydney",28,32]].map(([route,pct,rides])=>(
                      <div key={route} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",
                          fontSize:13,marginBottom:5}}>
                          <span style={{color:P.stone}}>{route}</span>
                          <span style={{fontFamily:FM,color:P.sage,fontSize:12}}>{rides} rides</span>
                        </div>
                        <div style={{height:5,background:P.sageL,borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:pct+"%",background:P.sage,borderRadius:99}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Team ── */}
              {bizPlan && bizTab==="team" && (
                <div style={{animation:"up .3s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:24}}>
                    <div>
                      <h2 style={{fontFamily:FD,fontSize:22,fontWeight:600,marginBottom:3}}>
                        Team members
                      </h2>
                      <div style={{fontSize:13,color:P.stone}}>5 active · 2 invited</div>
                    </div>
                    <Btn small onClick={()=>notify("📧 Invite sent!")}>+ Invite employee</Btn>
                  </div>
                  <div style={{background:P.paper,borderRadius:R+2,overflow:"hidden",
                    border:`1px solid ${P.pebble}22`}}>
                    <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr",
                      padding:"10px 18px",borderBottom:`1px solid ${P.pebble}22`,
                      fontSize:10,color:P.stone,fontFamily:FM,letterSpacing:.8}}>
                      {["EMPLOYEE","ROUTE","RIDES","SAVED","CO₂","STATUS"].map(h=>(
                        <div key={h}>{h}</div>
                      ))}
                    </div>
                    {[
                      {name:"Sarah Kim",   av:"SK", route:"Newtown → CBD",        rides:42, saved:189, co2:18.2, active:true},
                      {name:"Tom Nguyen",  av:"TN", route:"Parramatta → Olympic", rides:38, saved:152, co2:16.4, active:true},
                      {name:"Priya Sharma",av:"PS", route:"Bondi → Surry Hills",  rides:35, saved:175, co2:15.1, active:true},
                      {name:"Jake Morris", av:"JM", route:"Hornsby → Macquarie",  rides:29, saved:116, co2:12.5, active:true},
                      {name:"Lena Park",   av:"LP", route:"Chatswood → N.Sydney", rides:24, saved:96,  co2:10.3, active:true},
                      {name:"Omar Rashed", av:"OR", route:"—",                    rides:0,  saved:0,   co2:0,    active:false},
                      {name:"Amy Batiste", av:"AB", route:"—",                    rides:0,  saved:0,   co2:0,    active:false},
                    ].map((e,i,arr)=>(
                      <div key={e.name} style={{display:"grid",
                        gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr",
                        padding:"12px 18px",fontSize:13,alignItems:"center",
                        borderBottom:i<arr.length-1?`1px solid ${P.pebble}22`:"none",
                        opacity:e.active?1:.55}}>
                        <div style={{display:"flex",gap:9,alignItems:"center"}}>
                          <Av av={e.av} size={28}/>
                          <span style={{fontWeight:500}}>{e.name}</span>
                        </div>
                        <div style={{color:P.stone,fontSize:12}}>{e.route}</div>
                        <div style={{fontFamily:FM,color:e.rides?P.ink:P.pebble}}>{e.rides||"—"}</div>
                        <div style={{fontFamily:FM,color:e.saved?P.bark:P.pebble}}>
                          {e.saved?`$${e.saved}`:"—"}
                        </div>
                        <div style={{fontFamily:FM,color:e.co2?P.sage:P.pebble}}>
                          {e.co2?`${e.co2}t`:"—"}
                        </div>
                        <span style={{display:"inline-block",padding:"2px 8px",borderRadius:99,
                          fontSize:10,fontFamily:FM,
                          background:e.active?P.sageL:P.bg,
                          color:e.active?P.sage:P.pebble}}>
                          {e.active?"● Active":"◌ Invited"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ESG ── */}
              {bizPlan && bizTab==="esg" && (
                <div style={{animation:"up .3s"}}>
                  <h2 style={{fontFamily:FD,fontSize:22,fontWeight:600,marginBottom:4}}>
                    ESG & Sustainability
                  </h2>
                  <p style={{color:P.stone,fontSize:14,marginBottom:24}}>
                    Auditable metrics for your sustainability reporting obligations.
                  </p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
                    {[["🌿","8.9 tonnes","CO₂ avoided","148 trees equivalent",P.sage],
                      ["🏙","96 trips","Car trips removed","Less congestion",P.sage],
                      ["💛","$211/mo","Avg monthly saving","Per active commuter",P.bark],
                    ].map(([icon,val,label,sub,color])=>(
                      <div key={label} style={{background:P.paper,borderRadius:R+2,padding:20,
                        borderTop:`3px solid ${color}`,border:`1px solid ${P.pebble}22`}}>
                        <div style={{fontSize:26,marginBottom:10}}>{icon}</div>
                        <div style={{fontFamily:FD,fontSize:22,fontWeight:600,color,marginBottom:4}}>{val}</div>
                        <div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{label}</div>
                        <div style={{fontSize:11,color:P.stone,fontFamily:FM}}>{sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:P.paper,borderRadius:R+2,padding:22,
                    marginBottom:14,border:`1px solid ${P.pebble}22`}}>
                    <div style={{fontSize:10,color:P.stone,fontFamily:FM,
                      letterSpacing:.8,marginBottom:14}}>DISCLOSURE FRAMEWORK COVERAGE</div>
                    {[["GHG Protocol — Scope 3 (Employee Commuting)",80],
                      ["NZX Corporate Governance Code — Climate Risk",60],
                      ["B Corp — Environment Impact Area",70],
                      ["Global Reporting Initiative (GRI 305)",55],
                    ].map(([label,pct])=>(
                      <div key={label} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",
                          fontSize:12,marginBottom:4}}>
                          <span style={{color:P.stone}}>{label}</span>
                          <span style={{fontFamily:FM,color:P.sage}}>{pct}%</span>
                        </div>
                        <div style={{height:5,background:P.sageL,borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:pct+"%",background:P.sage,borderRadius:99}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Btn onClick={()=>notify("📄 ESG report generated!")}>
                    🌿 Download ESG report PDF
                  </Btn>
                </div>
              )}

              {/* ── Billing ── */}
              {bizPlan && bizTab==="billing" && (
                <div style={{animation:"up .3s"}}>
                  <h2 style={{fontFamily:FD,fontSize:22,fontWeight:600,marginBottom:4}}>
                    Billing & Plan
                  </h2>
                  <p style={{color:P.stone,fontSize:14,marginBottom:24}}>
                    Manage your RideShare for Business subscription.
                  </p>
                  <div style={{background:P.paper,borderRadius:R+2,padding:20,
                    marginBottom:16,display:"flex",justifyContent:"space-between",
                    alignItems:"center",border:`1px solid ${P.pebble}22`}}>
                    <div>
                      <div style={{fontFamily:FD,fontSize:18,fontWeight:600,
                        color:P.sage,marginBottom:2,textTransform:"capitalize"}}>
                        {bizPlan} Plan — Active ✓
                      </div>
                      <div style={{fontSize:13,color:P.stone}}>
                        Next billing: 1 May 2025 · NZD
                      </div>
                    </div>
                    <Btn outline small onClick={()=>setBizPlan(null)}>Change plan</Btn>
                  </div>
                  <div style={{background:P.paper,borderRadius:R+2,
                    overflow:"hidden",border:`1px solid ${P.pebble}22`}}>
                    <div style={{fontSize:10,color:P.stone,fontFamily:FM,letterSpacing:.8,
                      padding:"12px 18px",borderBottom:`1px solid ${P.pebble}22`}}>
                      INVOICE HISTORY
                    </div>
                    {[["1 Apr 2025","$249.50"],["1 Mar 2025","$237.00"],["1 Feb 2025","$237.00"]].map(([date,amt])=>(
                      <div key={date} style={{display:"flex",justifyContent:"space-between",
                        alignItems:"center",padding:"12px 18px",fontSize:13,
                        borderBottom:`1px solid ${P.pebble}22`}}>
                        <span style={{color:P.stone}}>{date}</span>
                        <span style={{fontFamily:FM,fontWeight:500}}>{amt} NZD</span>
                        <span style={{display:"inline-block",padding:"2px 8px",borderRadius:99,
                          fontSize:10,background:P.sageL,color:P.sage,fontFamily:FM}}>
                          Paid
                        </span>
                        <button style={{background:"none",border:`1px solid ${P.pebble}`,
                          borderRadius:6,padding:"4px 10px",color:P.stone,
                          fontSize:11,cursor:"pointer"}}>
                          PDF
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {detail && !rateTgt && (
        <Detail r={detail} onClose={()=>setDetail(null)}
          onBook={handleBook} onRate={r=>setRateTgt(r)}
          onSafety={r=>setSafety(r)}/>
      )}
      {rateTgt  && <RateModal   r={rateTgt} onClose={()=>setRateTgt(null)} onSubmit={handleRate}/>}
      {safety   && <SafetyModal r={safety}  onClose={()=>setSafety(null)}/>}
      {showPost && <PostModal   onClose={()=>setPost(false)} onPost={handlePost} isPro={sub==="pro"}/>}
      {showUrg  && <UrgentModal onClose={()=>setUrg(false)}  onPost={handleUrgent}/>}
      {showStu  && <StudentModal onClose={()=>setStu(false)} onVerify={()=>setStuV(true)}/>}

      {toast && (
        <div style={{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",
          background:P.ink,color:"#fff",borderRadius:R,padding:"10px 18px",
          fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,.18)",
          animation:"up .25s",zIndex:300,whiteSpace:"nowrap"}}>
          {toast}
        </div>
      )}
    </>
  );
}
