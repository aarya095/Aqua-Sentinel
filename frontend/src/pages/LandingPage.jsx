import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Activity,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Droplets,
  GitBranch,
  Layers3,
  MapPin,
  Menu,
  Network,
  Radar,
  ShieldCheck,
  Waves,
  X,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    number: "01",
    icon: Radar,
    title: "Incident Intelligence",
    description:
      "Investigate reported waterlogging incidents, evaluate their severity, and identify situations requiring immediate attention.",
    tags: ["Incident assessment", "Priority scoring"],
  },
  {
    number: "02",
    icon: Network,
    title: "Geospatial Awareness",
    description:
      "Connect incidents with nearby roads, critical infrastructure, and affected areas to understand their operational impact.",
    tags: ["Spatial analysis", "Infrastructure"],
  },
  {
    number: "03",
    icon: Zap,
    title: "Resource Optimization",
    description:
      "Generate resource allocation recommendations by matching response needs with available pumps and response teams.",
    tags: ["Pump allocation", "Team assignment"],
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Human-Guided Response",
    description:
      "Give municipal operators an explainable response plan they can review, approve, or reject before action is taken.",
    tags: ["Explainable decisions", "Human approval"],
  },
];

const workflow = [
  {
    number: "01",
    title: "Observe",
    description: "Gather information about rainfall, incidents, and city conditions.",
  },
  {
    number: "02",
    title: "Investigate",
    description: "Examine reported incidents and retrieve relevant context.",
  },
  {
    number: "03",
    title: "Assess",
    description: "Evaluate severity, potential impact, and response requirements.",
  },
  {
    number: "04",
    title: "Prioritize",
    description: "Rank incidents according to their urgency and impact.",
  },
  {
    number: "05",
    title: "Plan",
    description: "Recommend resource assignments and response actions.",
  },
  {
    number: "06",
    title: "Approve",
    description: "Let a human operator make the final decision.",
  },
];

function SectionLabel({ children }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-px w-8 bg-cyan-400" />
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
        {children}
      </span>
    </div>
  );
}

function Brand({ footer = false }) {
  return (
    <Link
      to="/"
      className="group flex w-fit items-center gap-3"
      aria-label="AquaSentinel home"
    >
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/30 bg-cyan-400/[0.08]">
        <Waves
          size={23}
          strokeWidth={1.8}
          className="text-cyan-400 transition-transform duration-300 group-hover:scale-110"
        />
        <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
      </div>

      <div>
        <div className="text-[15px] font-bold tracking-tight text-white">
          Aqua<span className="text-cyan-400">Sentinel</span>
        </div>

        <div className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.2em] text-slate-500">
          {footer ? "Urban resilience" : "Intelligence platform"}
        </div>
      </div>
    </Link>
  );
}

function CityVisualization() {
  return (
    <div className="relative mx-auto w-full max-w-[590px]">
      {/* Background glow */}
      <div className="absolute inset-10 rounded-full bg-cyan-500/[0.09] blur-[90px]" />

      {/* Main map panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#080f1c]/95 shadow-[0_25px_100px_rgba(0,0,0,0.45)]">
        {/* Panel header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
              <Radar size={17} />
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-wide text-slate-200">
                URBAN INTELLIGENCE
              </p>
              <p className="mt-1 text-[9px] text-slate-500">
                Illustrative city visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-[9px] font-semibold tracking-wider text-cyan-300">
              AI ASSISTED
            </span>
          </div>
        </div>

        {/* Stylized city map */}
        <div className="relative h-[315px] overflow-hidden bg-[#091422] sm:h-[365px]">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.11]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(100,180,220,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,220,0.35) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Map roads and districts */}
          <svg
            viewBox="0 0 560 365"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            aria-label="Illustrative city map with roads and incident markers"
          >
            <defs>
              <linearGradient id="roadGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#155e75" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0.12" />
              </linearGradient>

              <linearGradient id="waterGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.08" />
              </linearGradient>

              <pattern
                id="districtPattern"
                width="46"
                height="38"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="3"
                  y="3"
                  width="36"
                  height="27"
                  rx="3"
                  fill="#163247"
                  fillOpacity="0.52"
                  stroke="#31546b"
                  strokeOpacity="0.4"
                  strokeWidth="0.7"
                />
              </pattern>
            </defs>

            <rect width="560" height="365" fill="url(#districtPattern)" />

            {/* District blocks */}
            <g fill="#112b3d" stroke="#21465b" strokeWidth="1">
              <path d="M0 42 L130 18 L157 82 L34 110 Z" />
              <path d="M190 24 L295 0 L320 70 L210 95 Z" />
              <path d="M360 25 L465 8 L490 76 L375 98 Z" />
              <path d="M40 140 L145 118 L171 187 L58 213 Z" />
              <path d="M210 120 L325 95 L345 165 L230 190 Z" />
              <path d="M395 120 L525 100 L548 170 L418 192 Z" />
              <path d="M5 245 L120 220 L146 295 L30 320 Z" />
              <path d="M190 235 L302 210 L328 282 L212 308 Z" />
              <path d="M370 228 L485 208 L510 276 L395 300 Z" />
            </g>

            {/* Major roads */}
            <g
              fill="none"
              stroke="#416277"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.72"
            >
              <path d="M-20 175 L580 75" />
              <path d="M90 -20 L245 390" />
              <path d="M355 -20 L440 390" />
              <path d="M-20 295 L580 225" />
              <path d="M-20 55 L580 335" />
            </g>

            {/* Road center lines */}
            <g
              fill="none"
              stroke="#86b6c8"
              strokeWidth="1"
              strokeDasharray="5 7"
              opacity="0.45"
            >
              <path d="M-20 175 L580 75" />
              <path d="M90 -20 L245 390" />
              <path d="M355 -20 L440 390" />
              <path d="M-20 295 L580 225" />
            </g>

            {/* Waterway */}
            <path
              d="M-25 330 C65 280 80 350 170 300 S290 270 345 315 S455 360 585 275"
              fill="none"
              stroke="url(#waterGradient)"
              strokeWidth="27"
              strokeLinecap="round"
            />

            <path
              d="M-25 330 C65 280 80 350 170 300 S290 270 345 315 S455 360 585 275"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Highlighted response route */}
            <path
              d="M115 78 L175 142 L285 125 L350 195 L438 180"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 5"
              className="animate-[dash_18s_linear_infinite]"
            />

            {/* Incident markers */}
            {[
              { x: 175, y: 142, color: "#fb7185" },
              { x: 350, y: 195, color: "#fbbf24" },
              { x: 438, y: 180, color: "#fb7185" },
              { x: 285, y: 125, color: "#22d3ee" },
            ].map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="13"
                  fill={point.color}
                  fillOpacity="0.12"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  fill={point.color}
                  fillOpacity="0.2"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  fill={point.color}
                />
              </g>
            ))}

            {/* Infrastructure markers */}
            <g fill="#67e8f9">
              <rect x="107" y="230" width="9" height="9" rx="2" />
              <rect x="405" y="75" width="9" height="9" rx="2" />
              <rect x="258" y="275" width="9" height="9" rx="2" />
            </g>

            {/* Map labels */}
            <g
              fill="#8da9bd"
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="1.3"
            >
              <text x="35" y="25">NORTH DISTRICT</text>
              <text x="360" y="110">EAST SECTOR</text>
              <text x="195" y="328">CENTRAL CORRIDOR</text>
            </g>
          </svg>

          {/* Floating priority label */}
          <div className="absolute left-[22%] top-[32%] rounded-md border border-rose-400/25 bg-[#0a1422]/95 px-3 py-2 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="text-[9px] font-bold tracking-wider text-rose-300">
                HIGH PRIORITY
              </span>
            </div>
            <p className="mt-1 text-[9px] text-slate-400">
              Incident identified
            </p>
          </div>

          {/* Floating route label */}
          <div className="absolute bottom-5 right-4 rounded-lg border border-cyan-400/20 bg-[#081522]/95 px-3 py-2.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <GitBranch size={13} className="text-cyan-400" />
              <span className="text-[9px] font-semibold text-slate-200">
                RESPONSE ROUTE
              </span>
            </div>
            <p className="mt-1 text-[9px] text-slate-500">
              Illustrative route
            </p>
          </div>

          {/* Compass */}
          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-[10px] font-bold text-slate-400">
            N
          </div>
        </div>

        {/* Bottom information strip */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.08]">
          {[
            { icon: MapPin, label: "SPATIAL", value: "Context" },
            { icon: BrainCircuit, label: "AGENT", value: "Reasoning" },
            { icon: ShieldCheck, label: "OPERATOR", value: "Approval" },
          ].map((item) => (
            <div key={item.label} className="px-3 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <item.icon size={14} className="text-cyan-400" />
                <span className="text-[8px] font-semibold tracking-wider text-slate-500">
                  {item.label}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-slate-200">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI card */}
      <div className="absolute -left-3 top-[24%] hidden w-[158px] rounded-xl border border-white/10 bg-[#0c1625]/95 p-3 shadow-2xl backdrop-blur-xl sm:block lg:-left-10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/10">
            <BrainCircuit size={15} className="text-violet-300" />
          </div>
          <span className="text-[9px] font-semibold text-slate-300">
            AI ASSESSMENT
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-400" />
        </div>
        <p className="mt-2 text-[9px] text-slate-500">
          Severity & impact analysis
        </p>
      </div>

      {/* Floating human approval card */}
      <div className="absolute -right-2 bottom-[15%] hidden w-[170px] rounded-xl border border-emerald-400/20 bg-[#0c1625]/95 p-3 shadow-2xl backdrop-blur-xl sm:block lg:-right-7">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span className="text-[9px] font-semibold text-slate-200">
            HUMAN IN CONTROL
          </span>
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-slate-500">
          Recommendations remain subject to operator approval.
        </p>
      </div>
    </div>
  );
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050a13] font-sans text-slate-200 selection:bg-cyan-400/30 selection:text-white">
      {/* Global background effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-600/[0.07] blur-[130px]" />
        <div className="absolute right-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.06] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Navigation */}
      <header className="relative z-50 border-b border-white/[0.07] bg-[#050a13]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Brand />

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#platform"
              className="text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Platform
            </a>
            <a
              href="#capabilities"
              className="text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Capabilities
            </a>
            <a
              href="#workflow"
              className="text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Methodology
            </a>
            <a
              href="#human-control"
              className="text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Human Oversight
            </a>
          </div>

          <div className="hidden md:block">
            <Link
              to="/operations"
              className="group inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.08] px-4 py-2.5 text-[10px] font-bold tracking-wider text-cyan-300 transition hover:border-cyan-300/60 hover:bg-cyan-400/[0.14]"
            >
              LAUNCH PLATFORM
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 p-2 text-slate-300 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/[0.08] bg-[#080e19] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-5">
              {[
                ["Platform", "#platform"],
                ["Capabilities", "#capabilities"],
                ["Methodology", "#workflow"],
                ["Human Oversight", "#human-control"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className="text-sm text-slate-300"
                >
                  {label}
                </a>
              ))}

              <Link
                to="/operations"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-xs font-bold tracking-wider text-slate-950"
              >
                LAUNCH PLATFORM <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:px-12 lg:pb-32 lg:pt-28">
          {/* Hero copy */}
          <div className="relative z-10 max-w-[610px]">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-3.5 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-[10px]">
                Agentic AI · Urban Resilience
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,6.3vw,5.7rem)] font-semibold leading-[1.04] tracking-[-0.065em] text-white">
              Making cities
              <br />
              more resilient
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                to waterlogging.
              </span>
            </h1>

            <p className="mt-7 max-w-[490px] text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              Transform urban waterlogging incidents into prioritized,
              explainable response plans. AquaSentinel brings AI-driven
              investigation, geospatial intelligence, and resource allocation
              into one human-guided decision-support platform.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/operations"
                className="group inline-flex items-center justify-center gap-3 rounded-lg bg-cyan-400 px-6 py-4 text-xs font-bold tracking-wide text-[#041019] shadow-[0_0_35px_rgba(34,211,238,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_0_45px_rgba(34,211,238,0.2)]"
              >
                EXPLORE THE PLATFORM
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#workflow"
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/[0.12] bg-white/[0.025] px-6 py-4 text-xs font-semibold tracking-wide text-slate-300 transition hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
              >
                HOW IT WORKS
                <ArrowDown size={15} />
              </a>
            </div>

            {/* Technical identity */}
            <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.08] pt-6">
              {[
                "GEOSPATIAL INTELLIGENCE",
                "AI-ASSISTED PLANNING",
                "HUMAN OVERSIGHT",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <CircleDot
                    size={11}
                    className={index === 0 ? "text-cyan-400" : "text-slate-600"}
                  />
                  <span className="text-[8px] font-semibold tracking-[0.13em] text-slate-500 sm:text-[9px]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative lg:pl-4">
            <CityVisualization />
          </div>
        </div>

        {/* Bottom transition */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </section>

      {/* Capabilities */}
      <section
        id="capabilities"
        className="relative z-10 scroll-mt-20 px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <SectionLabel>Platform capabilities</SectionLabel>
              <h2 className="max-w-[650px] text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Intelligence that moves
                <br className="hidden sm:block" /> beyond the dashboard.
              </h2>
            </div>

            <p className="max-w-[400px] text-sm leading-7 text-slate-400">
              A coordinated workflow for understanding incidents, evaluating
              urgency, and preparing informed response recommendations.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((capability) => (
              <article
                key={capability.number}
                className="group relative overflow-hidden rounded-xl border border-white/[0.09] bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.025]"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/[0.04] blur-2xl transition group-hover:bg-cyan-400/[0.1]" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-400">
                    <capability.icon size={21} strokeWidth={1.7} />
                  </div>

                  <span className="font-mono text-[10px] text-slate-600">
                    /{capability.number}
                  </span>
                </div>

                <h3 className="relative mt-7 text-base font-semibold text-white">
                  {capability.title}
                </h3>

                <p className="relative mt-3 min-h-[105px] text-xs leading-6 text-slate-400">
                  {capability.description}
                </p>

                <div className="relative mt-5 flex flex-wrap gap-2">
                  {capability.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1.5 text-[9px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-7 h-px w-full bg-gradient-to-r from-cyan-400/40 via-cyan-400/10 to-transparent" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="workflow"
        className="relative z-10 scroll-mt-20 border-y border-white/[0.07] bg-[#080e19]/70 px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-[700px] text-center">
            <SectionLabel>Agentic workflow</SectionLabel>

            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              From incident to
              <span className="text-cyan-400"> informed action.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-[570px] text-sm leading-7 text-slate-400">
              A structured sequence of investigation, assessment, and planning
              helps turn fragmented city information into a response plan that
              a human operator can evaluate.
            </p>
          </div>

          <div className="relative mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflow.map((step, index) => (
              <article
                key={step.number}
                className="group relative rounded-xl border border-white/[0.08] bg-[#0a111e]/90 p-6 transition duration-300 hover:border-cyan-400/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-cyan-400">
                    STEP {step.number}
                  </span>

                  {index < workflow.length - 1 ? (
                    <ArrowDownRight
                      size={17}
                      className="text-slate-600 transition group-hover:text-cyan-400"
                    />
                  ) : (
                    <ShieldCheck size={17} className="text-emerald-400" />
                  )}
                </div>

                <h3 className="mt-6 text-lg font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {step.description}
                </p>

                <div className="mt-6 h-0.5 w-10 bg-slate-700 transition-all duration-300 group-hover:w-16 group-hover:bg-cyan-400" />
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.035] p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <BrainCircuit size={22} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  An agentic approach to response planning
                </h3>

                <p className="mt-2 max-w-[650px] text-xs leading-6 text-slate-400">
                  The agent uses tools to gather context, assess incidents,
                  and formulate recommendations rather than merely displaying
                  information on a map.
                </p>
              </div>
            </div>

            <Link
              to="/ai-control"
              className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              EXPLORE AI CONTROL <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Platform preview */}
      <section
        id="platform"
        className="relative z-10 scroll-mt-20 px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>Inside AquaSentinel</SectionLabel>

            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              One operational picture.
              <br />
              <span className="text-cyan-400">Clearer decisions.</span>
            </h2>

            <p className="mt-6 max-w-[470px] text-sm leading-7 text-slate-400">
              Explore the operational map, review AI-prioritized incidents,
              and inspect the proposed response plan through a unified
              decision-support interface.
            </p>

            <div className="mt-9 space-y-5">
              {[
                {
                  icon: Layers3,
                  title: "Operations",
                  text: "Explore the city situation and access response status.",
                },
                {
                  icon: BrainCircuit,
                  title: "AI Control",
                  text: "Inspect incident priorities and agent recommendations.",
                },
                {
                  icon: ShieldCheck,
                  title: "Response Approval",
                  text: "Review the proposed plan before accepting or rejecting it.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.03] text-cyan-400">
                    <item.icon size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-6 text-slate-500">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/operations"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                OPEN OPERATIONS <ArrowUpRight size={15} />
              </Link>

              <Link
                to="/ai-control"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                VIEW AI CONTROL <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Dashboard preview illustration */}
          <div className="relative">
            <div className="absolute inset-10 rounded-full bg-blue-500/[0.08] blur-[100px]" />

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#080f1a] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                    <Activity size={17} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-slate-200">
                      OPERATIONS OVERVIEW
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      Interface concept
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1.5">
                  <CircleDot size={10} className="text-cyan-400" />
                  <span className="text-[8px] text-slate-400">OVERVIEW</span>
                </div>
              </div>

              {/* Illustrative metrics, explicitly not live data */}
              <div className="grid grid-cols-3 gap-2 p-4 sm:gap-3 sm:p-5">
                {[
                  {
                    label: "INCIDENTS",
                    value: "—",
                    icon: MapPin,
                    color: "text-cyan-400",
                  },
                  {
                    label: "PRIORITIES",
                    value: "—",
                    icon: Activity,
                    color: "text-amber-400",
                  },
                  {
                    label: "RESOURCES",
                    value: "—",
                    icon: Zap,
                    color: "text-emerald-400",
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-3 sm:p-4"
                  >
                    <metric.icon size={15} className={metric.color} />
                    <p className="mt-4 text-[8px] font-medium tracking-wider text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Incident list */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-slate-300">
                    INCIDENT PRIORITIZATION
                  </span>
                  <span className="text-[8px] text-slate-500">
                    CONCEPT PREVIEW
                  </span>
                </div>

                {[
                  {
                    label: "High-priority incident",
                    subtitle: "Severity and impact assessment",
                    color: "bg-rose-400",
                    width: "w-[90%]",
                  },
                  {
                    label: "Resource recommendation",
                    subtitle: "Pump and team allocation",
                    color: "bg-amber-400",
                    width: "w-[70%]",
                  },
                  {
                    label: "Operator review",
                    subtitle: "Response plan approval",
                    color: "bg-emerald-400",
                    width: "w-[55%]",
                  },
                ].map((incident) => (
                  <div
                    key={incident.label}
                    className="mb-2 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${incident.color}`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-slate-200">
                          {incident.label}
                        </p>
                        <p className="mt-1 text-[9px] text-slate-500">
                          {incident.subtitle}
                        </p>

                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full ${incident.width} ${incident.color} opacity-70`}
                          />
                        </div>
                      </div>

                      <ArrowUpRight
                        size={13}
                        className="shrink-0 text-slate-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.08] bg-cyan-400/[0.025] px-5 py-3">
                <div className="flex items-center gap-2">
                  <CircleDot size={11} className="text-cyan-400" />
                  <span className="text-[9px] text-slate-400">
                    Illustrative interface — values are not live system data.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human in the loop */}
      <section
        id="human-control"
        className="relative z-10 scroll-mt-20 px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32"
      >
        <div className="mx-auto max-w-[1280px]">
          <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0b1b2a] via-[#09111e] to-[#0a0e19] p-7 sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-[90px]" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <SectionLabel>Human-in-the-loop AI</SectionLabel>

                <h2 className="max-w-[620px] text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  AI recommends.
                  <br />
                  <span className="text-cyan-400">
                    Humans decide.
                  </span>
                </h2>

                <p className="mt-6 max-w-[560px] text-sm leading-7 text-slate-400">
                  AquaSentinel is designed to support municipal decision-making,
                  not replace it. Every proposed response plan remains subject
                  to human review, approval, or rejection.
                </p>

                <Link
                  to="/ai-control"
                  className="group mt-8 inline-flex items-center gap-3 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.07] px-5 py-3.5 text-xs font-bold tracking-wide text-cyan-300 transition hover:border-cyan-300/50 hover:bg-cyan-400/[0.12]"
                >
                  EXPLORE AI CONTROL
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* Approval illustration */}
              <div className="relative rounded-xl border border-white/[0.09] bg-[#060c15]/80 p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-slate-300">
                    RESPONSE PLAN
                  </span>

                  <span className="rounded-md border border-amber-400/20 bg-amber-400/[0.07] px-2.5 py-1.5 text-[8px] font-bold tracking-wider text-amber-300">
                    PROPOSED
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    "Incident priorities assessed",
                    "Resource recommendations prepared",
                    "Response plan awaiting review",
                  ].map((item, index) => (
                    <div key={item} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          index < 2
                            ? "bg-cyan-400/10 text-cyan-400"
                            : "bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {index < 2 ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Clock3 size={12} />
                        )}
                      </div>

                      <p className="text-xs leading-5 text-slate-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-white/[0.08] pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white">
                        Operator authority preserved
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Human approval before action
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 border-t border-white/[0.07] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[900px] text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-400">
            <Droplets size={24} />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
            A smarter approach to urban resilience
          </p>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            See intelligence in action.
          </h2>

          <p className="mx-auto mt-5 max-w-[520px] text-sm leading-7 text-slate-400">
            Explore the operations interface, investigate prioritized
            incidents, and review the AI-assisted response planning workflow.
          </p>

          <Link
            to="/operations"
            className="group mt-8 inline-flex items-center gap-3 rounded-lg bg-cyan-400 px-7 py-4 text-xs font-bold tracking-wide text-slate-950 transition hover:bg-cyan-300"
          >
            ENTER AQUASENTINEL
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#04080f] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Brand footer />

          <p className="max-w-[400px] text-xs leading-6 text-slate-500">
            AI-assisted decision support for urban waterlogging response.
            Built around explainable recommendations and human oversight.
          </p>

          <div className="flex items-center gap-5">
            <Link
              to="/operations"
              className="text-xs text-slate-400 transition hover:text-cyan-300"
            >
              Operations
            </Link>

            <Link
              to="/ai-control"
              className="text-xs text-slate-400 transition hover:text-cyan-300"
            >
              AI Control
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-7 max-w-[1280px] border-t border-white/[0.06] pt-5">
          <p className="text-[10px] text-slate-600">
            AQUASENTINEL · AGENTIC AI FOR DYNAMIC URBAN WATERLOGGING RESPONSE
          </p>
        </div>
      </footer>

      {/* Small custom animation for the map route */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

export default LandingPage;