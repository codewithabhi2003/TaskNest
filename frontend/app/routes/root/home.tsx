import Navbar from "@/components/navbar";
import type { Route } from "../../+types/root";
import { useAuth } from "@/provider/auth-context";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskNest" },
    { name: "description", content: "Plan work. Track progress. Deliver projects." },
  ];
}

const heroStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  /* ── Light mode tokens (on .hn-root itself) ── */
  .hn-root {
    --ink:         #0d0f14;
    --paper:       #f5f4ef;
    --accent:      #e8ff47;
    --muted:       #6b7280;
    --border:      rgba(0,0,0,0.08);
    --chip-bg:     #ffffff;
    --chip-border: rgba(0,0,0,0.08);
    --chip-color:  #0d0f14;
    --fade-bg:     #f5f4ef;
  }

  /*
   * ── Dark mode tokens ──
   * IMPORTANT: isDark adds "dark" class TO .hn-root (not to a parent).
   * So the selector must be .hn-root.dark  (compound), NOT .dark .hn-root (descendant).
   */
  .hn-root.dark {
    --ink:         #f5f4ef;
    --paper:       #0d0f14;
    --accent:      #e8ff47;
    --muted:       #9ca3af;
    --border:      rgba(255,255,255,0.07);
    --chip-bg:     rgba(255,255,255,0.06);
    --chip-border: rgba(255,255,255,0.1);
    --chip-color:  #f5f4ef;
    --fade-bg:     #0d0f14;
  }

  .hn-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--paper);
    color: var(--ink);
    overflow-x: hidden;
    transition: background 0.3s, color 0.3s;
  }

  /* ── Hero ── */
  .hn-hero {
    position: relative;
    min-height: calc(100vh - 64px);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 5rem 1.5rem 3rem;
    text-align: center;
  }
  .hn-hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
    pointer-events: none;
  }

  /* accent blob */
  .hn-blob {
    position: absolute; top: -120px; left: 50%;
    transform: translateX(-50%);
    width: 720px; height: 420px;
    background: radial-gradient(ellipse, rgba(232,255,71,0.28) 0%, transparent 70%);
    pointer-events: none;
    animation: blobPulse 6s ease-in-out infinite;
  }
  .hn-root.dark .hn-blob {
    background: radial-gradient(ellipse, rgba(232,255,71,0.14) 0%, transparent 70%);
  }
  @keyframes blobPulse {
    0%,100% { transform: translateX(-50%) scale(1); }
    50%      { transform: translateX(-50%) scale(1.08); }
  }

  /* ── Badge — always dark bg, always yellow text ── */
  .hn-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #0d0f14; color: #e8ff47;
    border: 1px solid rgba(232,255,71,0.25);
    font-size: 0.7rem; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; padding: 5px 14px; border-radius: 999px;
    margin-bottom: 1.75rem;
    animation: fadeUp 0.5s ease both;
  }
  /* Dark mode: subtle lime tint bg */
  .hn-root.dark .hn-badge {
    background: rgba(232,255,71,0.1);
    border-color: rgba(232,255,71,0.35);
    color: #e8ff47;
  }
  .hn-badge-dot {
    width: 6px; height: 6px; background: var(--accent); border-radius: 50%;
    animation: dotBlink 1.4s ease-in-out infinite;
  }
  @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── Headline ── */
  .hn-headline {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.6rem, 6vw, 5rem);
    font-weight: 800; line-height: 1.05; letter-spacing: -0.03em;
    max-width: 820px; margin: 0 auto 1.25rem;
    color: var(--ink);
    animation: fadeUp 0.55s 0.1s ease both;
    transition: color 0.3s;
  }
  .hn-headline em { font-style: normal; position: relative; display: inline-block; }
  .hn-headline em::after {
    content: ''; position: absolute; left: 0; bottom: 4px;
    width: 100%; height: 10px; background: var(--accent);
    z-index: -1; transform: skewX(-4deg);
  }

  /* ── Sub ── */
  .hn-sub {
    font-size: clamp(1rem, 2vw, 1.15rem); color: var(--muted);
    max-width: 580px; margin: 0 auto 2.25rem; line-height: 1.75;
    animation: fadeUp 0.55s 0.2s ease both; transition: color 0.3s;
  }

  /* ── Hero CTA ── */
  .hn-ctas {
    display: flex; gap: 12px; flex-wrap: wrap;
    justify-content: center; margin-bottom: 3rem;
    animation: fadeUp 0.55s 0.3s ease both;
  }
  .hn-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--ink); color: var(--paper);
    font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.95rem;
    padding: 13px 28px; border-radius: 10px; border: 2px solid var(--ink);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
    text-decoration: none;
  }
  /* Light: hover → yellow */
  .hn-btn-primary:hover {
    background: var(--accent); color: #0d0f14; border-color: var(--accent);
    transform: translateY(-2px);
  }
  /* Dark: always yellow at rest, darker on hover */
  .hn-root.dark .hn-btn-primary {
    background: #e8ff47; color: #0d0f14; border-color: #e8ff47;
  }
  .hn-root.dark .hn-btn-primary:hover {
    background: #d4eb3a; border-color: #d4eb3a; transform: translateY(-2px);
  }
  .hn-btn-primary svg { transition: transform 0.2s; }
  .hn-btn-primary:hover svg { transform: translateX(3px); }

  /* ── Trust ── */
  .hn-trust {
    font-size: 0.78rem; color: var(--muted); letter-spacing: 0.04em;
    margin-bottom: 3.5rem;
    animation: fadeUp 0.55s 0.35s ease both; transition: color 0.3s;
  }
  .hn-trust span { color: var(--ink); font-weight: 500; transition: color 0.3s; }

  /* ── Feature chips ── */
  .hn-highlights {
    display: flex; gap: 10px; flex-wrap: wrap;
    justify-content: center; margin-bottom: 4rem;
    animation: fadeUp 0.55s 0.4s ease both;
  }
  .hn-chip {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--chip-bg); border: 1px solid var(--chip-border);
    border-radius: 999px; padding: 7px 16px;
    font-size: 0.82rem; font-weight: 500; color: var(--chip-color);
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s, transform 0.15s, background 0.3s, color 0.3s;
  }
  .hn-chip:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.1); transform: translateY(-2px); }
  .hn-root.dark .hn-chip:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.5); }
  .hn-chip-icon {
    width: 20px; height: 20px; background: var(--accent);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem;
  }

  /* ══════════════ PREVIEW ══════════════ */
  .hn-preview-wrap {
    width: 100%; max-width: 960px; margin: 0 auto;
    position: relative; animation: fadeUp 0.7s 0.5s ease both;
  }
  .hn-preview-wrap::before {
    content: ''; position: absolute; inset: -1px; border-radius: 20px;
    background: linear-gradient(135deg, var(--accent) 0%, transparent 60%);
    opacity: 0.3; z-index: 0; pointer-events: none;
  }
  .hn-preview-grid {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: 1.1fr 0.9fr;
    grid-template-rows: auto auto; gap: 12px; padding: 4px;
  }

  /* dark cards — always dark regardless of page theme */
  .pv-card {
    background: #13161d; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 16px; color: #fff;
    position: relative; overflow: hidden;
    transition: transform 0.25s, box-shadow 0.25s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  }
  .pv-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.4); }
  .hn-root.dark .pv-card { background: #1a1d24; border-color: rgba(255,255,255,0.06); box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .hn-root.dark .pv-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.65); }
  .pv-card-title { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); margin-bottom: 12px; }

  .pv-kanban { grid-column:1; grid-row:1; animation:floatA 5s ease-in-out infinite; }
  @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .pv-kanban:hover { animation-play-state:paused; }
  .pv-kanban-cols { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .pv-kancol { display:flex; flex-direction:column; gap:5px; }
  .pv-kancol-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
  .pv-kancol-name { font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:rgba(255,255,255,0.3); }
  .pv-kancol-cnt { font-size:0.58rem; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.35); padding:1px 6px; border-radius:99px; }
  .pv-kantask { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.07); border-radius:7px; padding:7px 9px; font-size:0.68rem; color:rgba(255,255,255,0.72); display:flex; flex-direction:column; gap:5px; transition:border-color 0.2s; }
  .pv-kantask:hover { border-color:rgba(232,255,71,0.4); }
  .pv-kantask.ac { border-left:2px solid #e8ff47; }
  .pv-kantask.gr { border-left:2px solid #34d399; }
  .pv-kantask.pu { border-left:2px solid #a78bfa; }
  .pv-kantask-foot { display:flex; align-items:center; justify-content:space-between; }
  .pv-av { width:15px; height:15px; border-radius:50%; font-size:0.48rem; font-weight:800; color:#0d0f14; display:flex; align-items:center; justify-content:center; }
  .pv-pill { font-size:0.55rem; font-weight:600; padding:1px 6px; border-radius:3px; }
  .pv-p-h { background:rgba(239,68,68,0.2); color:#f87171; }
  .pv-p-m { background:rgba(251,191,36,0.2); color:#fbbf24; }
  .pv-p-l { background:rgba(52,211,153,0.2); color:#34d399; }
  .pv-prog { height:2px; background:rgba(255,255,255,0.08); border-radius:1px; overflow:hidden; margin-top:2px; }
  .pv-prog-fill { height:100%; border-radius:1px; transition:width 1.2s cubic-bezier(.22,1,.36,1); }

  .pv-activity { grid-column:2; grid-row:1; animation:floatB 6s 1s ease-in-out infinite; }
  @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  .pv-activity:hover { animation-play-state:paused; }
  .pv-feed { display:flex; flex-direction:column; gap:8px; }
  .pv-feed-item { display:flex; align-items:flex-start; gap:9px; opacity:0; animation:feedIn 0.4s ease forwards; }
  .pv-feed-item:nth-child(1){ animation-delay:0.8s } .pv-feed-item:nth-child(2){ animation-delay:1.0s }
  .pv-feed-item:nth-child(3){ animation-delay:1.2s } .pv-feed-item:nth-child(4){ animation-delay:1.4s }
  .pv-feed-item:nth-child(5){ animation-delay:1.6s }
  @keyframes feedIn { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
  .pv-feed-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; margin-top:4px; }
  .pv-feed-text { font-size:0.67rem; color:rgba(255,255,255,0.55); line-height:1.5; }
  .pv-feed-text b { color:rgba(255,255,255,0.85); font-weight:600; }
  .pv-feed-time { font-size:0.58rem; color:rgba(255,255,255,0.25); margin-top:1px; }

  .pv-analytics { grid-column:1; grid-row:2; animation:floatC 5.5s 0.5s ease-in-out infinite; }
  @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  .pv-analytics:hover { animation-play-state:paused; }
  .pv-chart-meta { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .pv-chart-stat { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#fff; line-height:1; }
  .pv-chart-delta { font-size:0.62rem; color:#34d399; font-weight:500; margin-top:2px; }
  .pv-chart-tag { font-size:0.62rem; background:rgba(232,255,71,0.12); color:#e8ff47; padding:3px 9px; border-radius:99px; font-weight:500; }
  .pv-bars { display:flex; align-items:flex-end; gap:6px; height:64px; }
  .pv-bar-col { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; }
  .pv-bar { width:100%; border-radius:4px 4px 0 0; background:linear-gradient(to top,rgba(232,255,71,0.9),rgba(232,255,71,0.4)); transform-origin:bottom; transform:scaleY(0); transition:transform 1s cubic-bezier(.22,1,.36,1); }
  .pv-bar.grown { transform:scaleY(1); }
  .pv-bar.secondary { background:linear-gradient(to top,rgba(52,211,153,0.7),rgba(52,211,153,0.3)); }
  .pv-bar-lbl { font-size:0.52rem; color:rgba(255,255,255,0.25); }
  .pv-chart-legend { display:flex; gap:10px; margin-top:8px; }
  .pv-legend-item { display:flex; align-items:center; gap:5px; font-size:0.6rem; color:rgba(255,255,255,0.4); }
  .pv-legend-dot { width:7px; height:7px; border-radius:2px; }

  .pv-tasklist { grid-column:2; grid-row:2; animation:floatD 6.5s 1.5s ease-in-out infinite; }
  @keyframes floatD { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .pv-tasklist:hover { animation-play-state:paused; }
  .pv-tlist { display:flex; flex-direction:column; gap:6px; }
  .pv-titem { display:flex; align-items:center; gap:9px; padding:7px 8px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); font-size:0.68rem; color:rgba(255,255,255,0.7); transition:background 0.2s; opacity:0; animation:fadeUp 0.35s ease forwards; }
  .pv-titem:nth-child(1){ animation-delay:0.9s } .pv-titem:nth-child(2){ animation-delay:1.1s }
  .pv-titem:nth-child(3){ animation-delay:1.3s } .pv-titem:nth-child(4){ animation-delay:1.5s }
  .pv-titem:hover { background:rgba(255,255,255,0.07); }
  .pv-titem.done { text-decoration:line-through; color:rgba(255,255,255,0.3); }
  .pv-check { width:14px; height:14px; border-radius:50%; flex-shrink:0; border:1.5px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:0.5rem; }
  .pv-check.checked { background:#34d399; border-color:#34d399; color:#0d0f14; }
  .pv-titem-right { margin-left:auto; display:flex; align-items:center; gap:6px; }
  .pv-mini-prio { font-size:0.55rem; font-weight:600; padding:1px 5px; border-radius:3px; }
  .pv-donut-row { display:flex; align-items:center; gap:10px; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06); }
  .pv-donut-wrap { position:relative; width:44px; height:44px; flex-shrink:0; }
  .pv-donut-wrap svg { transform:rotate(-90deg); }
  .pv-donut-lbl { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:0.7rem; font-weight:800; color:#fff; pointer-events:none; }
  .pv-donut-sub { font-size:0.52rem; color:rgba(255,255,255,0.3); font-family:'DM Sans',sans-serif; font-weight:400; }
  .pv-donut-meta { display:flex; flex-direction:column; gap:4px; }
  .pv-donut-stat { font-size:0.62rem; color:rgba(255,255,255,0.45); }
  .pv-donut-stat b { color:#fff; font-weight:600; }

  /* bottom page fade */
  .hn-mockup-fade {
    position:absolute; bottom:-10px; left:0; right:0; height:100px;
    background:linear-gradient(to top, var(--fade-bg), transparent);
    z-index:2; pointer-events:none; border-radius:0 0 20px 20px;
    transition:background 0.3s;
  }

  /* ── Navbar overrides — .hn-root.dark is the ancestor so child selectors work ── */
  .hn-root.dark .tn-nav { background: rgba(13,15,20,0.92); border-bottom: 1px solid rgba(255,255,255,0.08); }
  .hn-root.dark .tn-logo-text { color: #f5f4ef !important; }
  .hn-root.dark .tn-nav-link { color: rgba(255,255,255,0.6); }
  .hn-root.dark .tn-nav-link:hover { color: #f5f4ef; background: rgba(255,255,255,0.07); }
  .hn-root.dark .tn-btn-ghost { color: rgba(255,255,255,0.65); }
  .hn-root.dark .tn-btn-ghost:hover { color: #f5f4ef; background: rgba(255,255,255,0.07); }
  .hn-root.dark .tn-btn-primary { background: #e8ff47 !important; color: #0d0f14 !important; border-color: #e8ff47 !important; }
  .hn-root.dark .tn-btn-primary:hover { background: #d4eb3a !important; border-color: #d4eb3a !important; transform: translateY(-1px); }

  @keyframes fadeUp {
    from { opacity:0; transform: translateY(18px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @media (max-width: 700px) {
    .hn-preview-grid { grid-template-columns: 1fr; }
    .pv-activity, .pv-tasklist { display: none; }
  }
`;

/* ── Sub-components ── */
function BarChart() {
  const [grown, setGrown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGrown(true); }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  const bars = [
    { h:"45%",label:"M",sec:false },{ h:"65%",label:"T",sec:false },{ h:"50%",label:"W",sec:true },
    { h:"80%",label:"T",sec:false },{ h:"60%",label:"F",sec:false },{ h:"90%",label:"S",sec:true },{ h:"72%",label:"S",sec:false },
  ];
  return (
    <div ref={ref}>
      <div className="pv-bars">
        {bars.map((b, i) => (
          <div key={i} className="pv-bar-col">
            <div className={`pv-bar${b.sec?" secondary":""}${grown?" grown":""}`} style={{ height:b.h, transitionDelay:`${i*0.07}s` }} />
            <span className="pv-bar-lbl">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 600); return () => clearTimeout(t); }, [pct]);
  return <div className="pv-prog"><div className="pv-prog-fill" style={{ width:`${width}%`, background:color }} /></div>;
}

function MiniDonut({ pct }: { pct: number }) {
  const r = 18; const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 700); return () => clearTimeout(t); }, []);
  const dash = animated ? circ * (pct / 100) : 0;
  return (
    <div className="pv-donut-wrap">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e8ff47" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="pv-donut-lbl">{pct}%<span className="pv-donut-sub">done</span></div>
    </div>
  );
}

/* ── Main page ── */
const Homepage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mirror <html class="dark"> onto .hn-root so scoped CSS vars resolve correctly.
  // The class is added TO .hn-root (compound), not as a parent (descendant).
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const handleGetStarted = () => navigate(isAuthenticated ? "/workspaces/create" : "/sign-up");

  return (
    <div className={`hn-root min-h-screen flex flex-col${isDark ? " dark" : ""}`}>
      <style>{heroStyles}</style>
      <Navbar />

      <section className="hn-hero">
        <div className="hn-blob" />

        {/* Badge — background: var(--ink) = dark in light, light in dark ✓ */}
        <div className="hn-badge">
          <span className="hn-badge-dot" />
          A productivity workspace built for modern teams
        </div>

        <h1 className="hn-headline">
          Plan work. Track progress.<br />
          <em>Deliver projects.</em>
        </h1>

        <p className="hn-sub">
          TaskNest is a project management platform designed to organise tasks,
          visualise progress, and help teams collaborate efficiently in one structured workspace.
        </p>

        <div className="hn-ctas">
          <button onClick={handleGetStarted} className="hn-btn-primary">
            Create Your Workspace
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <p className="hn-trust">
          <span>Free to use</span> · <span>Fast setup</span> · Built for productive teams
        </p>

        <div className="hn-highlights">
          <div className="hn-chip"><span className="hn-chip-icon">⚡</span>Real-time collaboration</div>
          <div className="hn-chip"><span className="hn-chip-icon">📊</span>Visual analytics</div>
          <div className="hn-chip"><span className="hn-chip-icon">🗂</span>Kanban &amp; sprint views</div>
        </div>

        <div className="hn-preview-wrap">
          <div className="hn-preview-grid">

            {/* 1 — Kanban */}
            <div className="pv-card pv-kanban">
              <div className="pv-card-title">Board — Sprint 12</div>
              <div className="pv-kanban-cols">
                <div className="pv-kancol">
                  <div className="pv-kancol-hdr"><span className="pv-kancol-name">To Do</span><span className="pv-kancol-cnt">4</span></div>
                  <div className="pv-kantask pu"><span>Auth — OAuth2 flow</span><div className="pv-kantask-foot"><div className="pv-av" style={{background:"#a78bfa"}}>JS</div><span className="pv-pill pv-p-m">Med</span></div></div>
                  <div className="pv-kantask"><span>Update docs</span><div className="pv-kantask-foot"><div className="pv-av" style={{background:"#60a5fa"}}>KL</div><span className="pv-pill pv-p-l">Low</span></div></div>
                </div>
                <div className="pv-kancol">
                  <div className="pv-kancol-hdr"><span className="pv-kancol-name">In Progress</span><span className="pv-kancol-cnt">3</span></div>
                  <div className="pv-kantask ac"><span>Analytics dashboard</span><ProgBar pct={72} color="#e8ff47" /><div className="pv-kantask-foot"><div className="pv-av" style={{background:"#e8ff47"}}>AM</div><span className="pv-pill pv-p-h">High</span></div></div>
                  <div className="pv-kantask gr"><span>CI/CD pipeline</span><ProgBar pct={40} color="#34d399" /><div className="pv-kantask-foot"><div className="pv-av" style={{background:"#34d399"}}>RP</div><span className="pv-pill pv-p-m">Med</span></div></div>
                </div>
                <div className="pv-kancol">
                  <div className="pv-kancol-hdr"><span className="pv-kancol-name">Done</span><span className="pv-kancol-cnt">5</span></div>
                  <div className="pv-kantask" style={{opacity:0.5}}><span>Design tokens</span><div className="pv-kantask-foot"><div className="pv-av" style={{background:"#f472b6"}}>TC</div><span className="pv-pill pv-p-l">Done ✓</span></div></div>
                  <div className="pv-kantask" style={{opacity:0.5}}><span>DB schema v2</span><div className="pv-kantask-foot"><div className="pv-av" style={{background:"#fb923c"}}>MN</div><span className="pv-pill pv-p-l">Done ✓</span></div></div>
                </div>
              </div>
            </div>

            {/* 2 — Activity feed */}
            <div className="pv-card pv-activity">
              <div className="pv-card-title">Recent Activity</div>
              <div className="pv-feed">
                {[
                  { color:"#e8ff47", text:<><b>Arjun</b> moved "API integration" to Done</>,    time:"2m ago"  },
                  { color:"#34d399", text:<><b>Kavya</b> added a comment on "Login page"</>,     time:"11m ago" },
                  { color:"#a78bfa", text:<><b>Riya</b> created task "Write test cases"</>,      time:"28m ago" },
                  { color:"#60a5fa", text:<><b>Priya</b> updated priority → High</>,             time:"1h ago"  },
                  { color:"#f472b6", text:<><b>Team</b> completed Sprint 11 — 94% tasks done</>, time:"3h ago"  },
                ].map((item, i) => (
                  <div key={i} className="pv-feed-item">
                    <div className="pv-feed-dot" style={{background:item.color}} />
                    <div><div className="pv-feed-text">{item.text}</div><div className="pv-feed-time">{item.time}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 — Analytics */}
            <div className="pv-card pv-analytics">
              <div className="pv-card-title">Velocity — last 7 days</div>
              <div className="pv-chart-meta">
                <div><div className="pv-chart-stat">31</div><div className="pv-chart-delta">↑ 18% vs last week</div></div>
                <div className="pv-chart-tag">On track</div>
              </div>
              <BarChart />
              <div className="pv-chart-legend">
                <div className="pv-legend-item"><div className="pv-legend-dot" style={{background:"rgba(232,255,71,0.7)"}}/>Completed</div>
                <div className="pv-legend-item"><div className="pv-legend-dot" style={{background:"rgba(52,211,153,0.7)"}}/>Reviewed</div>
              </div>
            </div>

            {/* 4 — Task list + donut */}
            <div className="pv-card pv-tasklist">
              <div className="pv-card-title">My Tasks</div>
              <div className="pv-tlist">
                {[
                  { label:"Set up project repo",     done:true,  p:"pv-p-l", pt:"Low"  },
                  { label:"Design system tokens",    done:true,  p:"pv-p-l", pt:"Done" },
                  { label:"Dashboard analytics v2",  done:false, p:"pv-p-h", pt:"High" },
                  { label:"Write API documentation", done:false, p:"pv-p-m", pt:"Med"  },
                ].map((t, i) => (
                  <div key={i} className={`pv-titem${t.done?" done":""}`}>
                    <div className={`pv-check${t.done?" checked":""}`}>{t.done?"✓":""}</div>
                    <span>{t.label}</span>
                    <div className="pv-titem-right"><span className={`pv-mini-prio ${t.p}`}>{t.pt}</span></div>
                  </div>
                ))}
              </div>
              <div className="pv-donut-row">
                <MiniDonut pct={64} />
                <div className="pv-donut-meta">
                  <div className="pv-donut-stat"><b>31</b> tasks completed</div>
                  <div className="pv-donut-stat"><b>11</b> in progress</div>
                  <div className="pv-donut-stat"><b>6</b> not started</div>
                </div>
              </div>
            </div>

          </div>
          <div className="hn-mockup-fade" />
        </div>

      </section>
    </div>
  );
};

export default Homepage;