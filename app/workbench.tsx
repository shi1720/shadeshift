"use client";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  Layers,
  MapPin,
  Sun,
  Shield,
  Leaf,
  SlidersHorizontal,
  ArrowRight,
  Download,
  Check,
  Info,
  ChevronDown,
  FolderOpen,
  LogOut,
  Plus,
  Trash2,
  Upload,
  RotateCcw,
  Droplets,
  Menu,
  X,
  BookOpen,
  Wallet,
  Save,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  defaultScenario,
  evaluate,
  optimize,
  packages,
  Scenario,
  PackageId,
  getCorridors,
  sensitivity,
  toCsv,
  MODEL_VERSION,
  snapshot,
} from "../lib/model";
import { scenarioSchema } from "../lib/validation";
import CorridorMap from "./corridor-map";
import CityAtlas from "./city-atlas";
import Evidence from "./evidence";
import AuthDialog from "./auth-dialog";
import { auth, listPlans, persistPlan, deletePlan } from "../lib/firebase";
import { signOut } from "firebase/auth";
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const num = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
type Tab = "studio" | "atlas" | "evidence" | "legacy" | "plans";
type Saved = {
  modelVersion: string;
  id: string;
  name: string;
  scenario: Scenario;
  updated_at: string;
};
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Workbench({
  user,
}: {
  user: { displayName: string; email: string; uid: string } | null;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [tab, setTab] = useState<Tab>("studio"),
    [s, setS] = useState<Scenario>(structuredClone(defaultScenario)),
    [selected, setSelected] = useState("rail"),
    [heat, setHeat] = useState(true),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState<Saved[]>([]),
    [savedError, setSavedError] = useState(""),
    [showExport, setShowExport] = useState(false),
    [menu, setMenu] = useState(false),
    [compare, setCompare] = useState<Scenario | null>(null),
    [saveDialog, setSaveDialog] = useState(false),
    [guide, setGuide] = useState(false);
  const [authDialog, setAuthDialog] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  function signIn() {
    setAuthDialog(true);
  }
  const closeAuth = useCallback(() => setAuthDialog(false), []);
  async function logout() {
    try {
      await signOut(auth);
      setSaved([]);
      setTab("studio");
      setNotice("Signed out. Your saved plans remain private.");
    } catch {
      setNotice("Could not sign out. Please try again.");
    }
  }
  useEffect(() => {
    if (!saveDialog && !guide) return;
    const prior = document.activeElement as HTMLElement;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, a[href], select, [tabindex="0"]',
        ) ?? [],
      );
    focusable()[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSaveDialog(false);
        setGuide(false);
      }
      if (e.key === "Tab") {
        const nodes = focusable(),
          first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      prior?.focus();
    };
  }, [saveDialog, guide]);
  const inputValid = scenarioSchema.safeParse(s).success;
  const r = useMemo(() => evaluate(s), [s]),
    selectedCorridor = getCorridors(s).find((c) => c.id === selected)!,
    selectedResult = r.rows.find((c) => c.id === selected)!;
  const choose = useCallback((id: string) => setSelected(id), []);
  const set = (key: keyof Scenario, value: unknown) =>
    setS((prev) => ({ ...prev, [key]: value }));
  const updatePackage = (id: string, p: PackageId) =>
    setS((prev) => ({ ...prev, packages: { ...prev.packages, [id]: p } }));
  const edit = (key: string, value: number) =>
    setS((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [selected]: { ...prev.overrides[selected], [key]: value },
      },
    }));
  function optimizePlan() {
    if (!inputValid) {
      setNotice(
        "Fix the demand weights: positive arrivals require at least one positive weight.",
      );
      return;
    }
    const o = optimize(s);
    if (!o.feasible) {
      setNotice(
        o.noBenefit
          ? "No intervention provides a modeled exposure benefit with these inputs. No purchase is recommended. Your plan is unchanged."
          : "No plan meets both constraints. Increase the budget or lower the community allocation. Your current plan is unchanged.",
      );
      return;
    }
    setS((prev) => ({ ...prev, packages: o.packages }));
    setNotice(
      `Best direct-sun reduction within this catalog. ${num(o.examined)} budget-feasible combinations checked. Water service is reported separately; add a refill hub if your operations require it.`,
    );
  }
  async function loadPlans() {
    setBusy(true);
    setSavedError("");
    try {
      setSaved(await listPlans());
    } catch (e) {
      setSavedError(e instanceof Error ? e.message : "Could not load plans.");
    } finally {
      setBusy(false);
    }
  }
  async function savePlan() {
    setBusy(true);
    try {
      await persistPlan(s);
      setSaveDialog(false);
      setNotice("Plan saved to your account. Find it in Saved plans.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  async function removePlan(id: string) {
    setBusy(true);
    try {
      await deletePlan(id);
      setSaved((prev) => prev.filter((p) => p.id !== id));
      setNotice("Plan deleted.");
    } catch (e) {
      setSavedError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }
  async function importPlan(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 20000)
        throw Error("Use a scenario JSON file under 20 KB.");
      const raw = JSON.parse(await file.text());
      if (raw.modelVersion && raw.modelVersion !== MODEL_VERSION)
        throw Error(
          "This file uses a different model version. Use the matching ShadeShift release.",
        );
      const parsed = scenarioSchema.safeParse(raw.scenario ?? raw);
      if (!parsed.success)
        throw Error(
          "This file is not a valid ShadeShift scenario. No changes were made.",
        );
      setS(parsed.data);
      setTab("studio");
      setNotice("Scenario imported. Review its assumptions before use.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Import failed.");
    }
    if (fileInput.current) fileInput.current.value = "";
  }
  const nav = [
    { id: "studio" as Tab, name: "Scenario studio", icon: Layers },
    { id: "atlas" as Tab, name: "Host city atlas", icon: MapPin },
    { id: "evidence" as Tab, name: "Evidence & method", icon: Shield },
    { id: "legacy" as Tab, name: "Legacy & delivery", icon: Leaf },
    { id: "plans" as Tab, name: "Saved plans", icon: FolderOpen },
  ];
  const navTo = (t: Tab) => {
    setTab(t);
    setMenu(false);
    setShowExport(false);
    setNotice("");
    window.scrollTo({ top: 0 });
    if (t === "plans" && user) void loadPlans();
  };
  const bars = r.rows.map((c) => ({
    name: c.short,
    Baseline: Math.round(c.base / 60),
    "With plan": Math.round(c.after / 60),
  }));
  const years = Array.from({ length: 6 }, (_, i) => ({
    name: i === 0 ? "Event year" : `Year ${i + 1}`,
    Event: Math.round((r.eventSavings * (i + 1)) / 60),
    Community: Math.round((r.legacy * (i + 1)) / 60),
  }));
  return (
    <div
      className="shell"
      inert={!hydrated}
      data-ready={hydrated}
      aria-busy={!hydrated}
    >
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <a className="brand" href="/">
          <span className="brand-mark">
            <Sun size={23} />
          </span>
          ShadeShift<span className="brand-dot">.</span>
        </a>
        <button
          className="mobile-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        <div className="workspace-tag">CITY OPERATIONS / 2026</div>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => navTo(n.id)}
              className={tab === n.id ? "active" : ""}
              aria-current={tab === n.id ? "page" : undefined}
            >
              <n.icon size={18} />
              {n.name}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="pilot-badge">HOUSTON PILOT</span>
          <p>
            Small interventions.
            <br />A cooler last mile.
          </p>
          {user ? (
            <>
              <div className="account-avatar">
                {user.displayName.slice(0, 1).toUpperCase()}
                <span title={user.displayName}>{user.displayName}</span>
              </div>
              <button className="sidebar-signin" onClick={logout}>
                <LogOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <button className="sidebar-signin" onClick={signIn}>
              Sign in to save plans <ArrowUpRight size={16} />
            </button>
          )}
        </div>
      </aside>
      <main>
        <header>
          <span>
            Workspace <span className="slash">/</span>{" "}
            {nav.find((n) => n.id === tab)?.name}
          </span>
          <div className="header-right">
            <button className="text-button" onClick={() => setGuide(true)}>
              <BookOpen size={16} />
              Demo guide
            </button>
            <span className="tag">Track 03 · Public health</span>
          </div>
        </header>
        <div className="page">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {tab === "studio"
                  ? "FROM THE TRAIN TO THE TURNSTILE"
                  : tab === "atlas"
                    ? "ELEVEN HOST MARKETS. ONE REPEATABLE METHOD."
                    : tab === "evidence"
                      ? "EVERY NUMBER HAS A JOB. AND A SOURCE."
                      : tab === "legacy"
                        ? "THE FINAL WHISTLE IS NOT THE FINISH LINE."
                        : "YOUR INVESTMENT WORKSPACE"}
              </div>
              <h1>
                {tab === "studio"
                  ? "Make the last mile cooler."
                  : tab === "atlas"
                    ? "A national lens. A local decision."
                    : tab === "evidence"
                      ? "Evidence you can inspect."
                      : tab === "legacy"
                        ? "Build for the next 1,000 days."
                        : "Keep the plans worth making."}
              </h1>
              <p>
                {tab === "studio"
                  ? "Put limited resources where people spend the most time in the sun."
                  : tab === "atlas"
                    ? "Screen comparable weather context, then validate the streets that matter."
                    : tab === "evidence"
                      ? "Measured geography, historical weather and explicit planning assumptions."
                      : tab === "legacy"
                        ? "Reusable shade can keep working long after the crowd goes home."
                        : "Save, compare and revisit the assumptions behind an investment."}
              </p>
            </div>
            {tab === "studio" && (
              <div className="heading-actions">
                <button
                  className="secondary"
                  onClick={() => (user ? setSaveDialog(true) : signIn())}
                >
                  <Save size={16} />
                  Save plan
                </button>
                <div className="export-wrap">
                  <button
                    className="primary"
                    aria-expanded={showExport}
                    onClick={() => setShowExport(!showExport)}
                  >
                    <Download size={16} />
                    Export <ChevronDown size={14} />
                  </button>
                  {showExport && (
                    <div className="export-menu">
                      <button
                        onClick={() => {
                          download(
                            "shadeshift-scenario.csv",
                            toCsv(s),
                            "text/csv",
                          );
                          setShowExport(false);
                        }}
                      >
                        Decision table (.csv)
                      </button>
                      <button
                        onClick={() => {
                          download(
                            "shadeshift-scenario.json",
                            JSON.stringify(snapshot(s), null, 2),
                            "application/json",
                          );
                          setShowExport(false);
                        }}
                      >
                        Reproducible plan (.json)
                      </button>
                      <button
                        onClick={() => {
                          setShowExport(false);
                          window.print();
                        }}
                      >
                        Printable decision brief
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {!inputValid && (
            <div className="notice error" role="alert">
              Scenario inputs are invalid. Positive arrivals require at least
              one link with a positive demand weight. Results are not valid
              until corrected.
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              <Info size={17} />
              <span>{notice}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {tab === "studio" && (
            <>
              <div className="context-bar">
                <span>
                  <MapPin size={17} />
                  Houston · NRG Stadium
                </span>
                <span>2026 case study / reusable event plan</span>
                <button className="tag amber" onClick={() => navTo("evidence")}>
                  Illustrative demand & costs <Info size={12} />
                </button>
              </div>
              <div className="metrics metrics-four">
                <div className="metric metric-feature">
                  <span>
                    Direct-sun exposure avoided <Sun size={16} />
                  </span>
                  <strong>
                    {r.reduction.toFixed(1)}
                    <small>%</small>
                  </strong>
                  <p>{compact(r.saved / 60)} person-hours per arrival window</p>
                </div>
                <div className="metric">
                  <span>
                    Investment <Wallet size={16} />
                  </span>
                  <strong>{money(r.cost)}</strong>
                  <p className={!r.budgetValid ? "danger" : ""}>
                    {r.budgetValid
                      ? `${money(s.budget - r.cost)} left in budget`
                      : `${money(r.cost - s.budget)} over budget`}
                  </p>
                </div>
                <div className="metric">
                  <span>
                    Community-weighted allocation <Leaf size={16} />
                  </span>
                  <strong>
                    {r.residentPercent.toFixed(0)}
                    <small>%</small>
                  </strong>
                  <p className={!r.equityValid ? "danger" : ""}>
                    {s.residentMinimum}% minimum · assumed local use
                  </p>
                </div>
                <div className="metric">
                  <span>
                    Refill service capacity <Droplets size={16} />
                  </span>
                  <strong>{num(r.water)}</strong>
                  <p>Refills per arrival window · separate benefit</p>
                </div>
              </div>
              <div className="studio-grid">
                <section className="panel geography">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">01 / LOCATE THE GAP</span>
                      <h2>The exposed last mile</h2>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={heat}
                        onChange={(e) => setHeat(e.target.checked)}
                      />
                      Historical heat
                    </label>
                  </div>
                  <CorridorMap
                    scenario={s}
                    selected={selected}
                    onSelect={choose}
                    showHeat={heat}
                  />
                  <div className="map-footer">
                    <span>
                      <i className="legend-line green" />
                      Investment selected
                    </span>
                    <span>
                      <i className="legend-line orange" />
                      Baseline
                    </span>
                    <span>Click a numbered link to inspect</span>
                  </div>
                  <div className="corridor-chips">
                    {r.rows.map((c, i) => (
                      <button
                        className={selected === c.id ? "selected" : ""}
                        key={c.id}
                        onClick={() => setSelected(c.id)}
                      >
                        <span>{i + 1}</span>
                        {c.short}
                      </button>
                    ))}
                  </div>
                </section>
                <section className="panel allocation">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">02 / SET THE CONSTRAINTS</span>
                      <h2>A better use of the budget</h2>
                    </div>
                    <SlidersHorizontal size={20} />
                  </div>
                  <div className="allocation-body">
                    <label className="slider-label" htmlFor="budget">
                      Available investment <b>{money(s.budget)}</b>
                    </label>
                    <input
                      className="slider"
                      id="budget"
                      type="range"
                      min="0"
                      max="150000"
                      step="1000"
                      value={s.budget}
                      onChange={(e) => set("budget", +e.target.value)}
                    />
                    <div className="range-labels">
                      <span>$0</span>
                      <span>$150,000</span>
                    </div>
                    <label className="slider-label" htmlFor="equity">
                      Community allocation <b>{s.residentMinimum}% minimum</b>
                    </label>
                    <input
                      className="slider"
                      id="equity"
                      type="range"
                      min="0"
                      max="80"
                      step="5"
                      value={s.residentMinimum}
                      onChange={(e) => set("residentMinimum", +e.target.value)}
                    />
                    <p className="field-help">
                      Cost weighted by each link’s assumed share of everyday
                      local use.
                    </p>
                    <button className="optimize-button" onClick={optimizePlan}>
                      <Sun size={17} />
                      Optimize investment <ArrowRight size={18} />
                    </button>
                    <p className="algorithm-note">
                      Exact search · 6 links · 5 options each
                      <br />
                      Maximizes direct-sun person-minutes avoided.
                    </p>
                    <div className="divider" />
                    <div className="compact-fields">
                      <label>
                        Arrival visitors
                        <input
                          type="number"
                          min="0"
                          max="200000"
                          step="1000"
                          value={s.attendance}
                          onChange={(e) =>
                            set(
                              "attendance",
                              Math.max(0, Math.min(200000, +e.target.value)),
                            )
                          }
                        />
                      </label>
                      <label>
                        Arrival hour
                        <select
                          value={s.hour}
                          onChange={(e) => set("hour", +e.target.value)}
                        >
                          {Array.from({ length: 11 }, (_, i) => i + 10).map(
                            (h) => (
                              <option key={h} value={h}>
                                {h > 12 ? h - 12 : h}:00 {h >= 12 ? "pm" : "am"}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    </div>
                    <div className="weather-context">
                      <Sun size={23} />
                      <div>
                        <b>
                          {Math.round(r.heatIndex)}°F{" "}
                          <span>heat index in shade</span>
                        </b>
                        <small>Scenario context · not a forecast</small>
                      </div>
                    </div>
                    <div className="compact-fields">
                      <label>
                        Air temperature (°F)
                        <input
                          type="number"
                          min="60"
                          max="115"
                          value={s.temperature}
                          onChange={(e) =>
                            set(
                              "temperature",
                              Math.max(60, Math.min(115, +e.target.value)),
                            )
                          }
                        />
                      </label>
                      <label>
                        Relative humidity (%)
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={s.humidity}
                          onChange={(e) =>
                            set(
                              "humidity",
                              Math.max(5, Math.min(100, +e.target.value)),
                            )
                          }
                        />
                      </label>
                    </div>
                    <p className="field-help">
                      Heat index adds weather context. It does not drive the
                      sun-exposure calculation.
                    </p>
                  </div>
                </section>
              </div>
              <div className="detail-grid">
                <section className="panel corridor-detail">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">03 / INSPECT A CANDIDATE</span>
                      <h2>{selectedCorridor.name}</h2>
                    </div>
                    <span className="tag">{selectedCorridor.kind}</span>
                  </div>
                  <div className="detail-body">
                    <div className="package-select">
                      <label htmlFor="package">Intervention package</label>
                      <select
                        id="package"
                        value={s.packages[selected] ?? "none"}
                        onChange={(e) =>
                          updatePackage(selected, e.target.value as PackageId)
                        }
                      >
                        {Object.entries(packages).map(([id, p]) => (
                          <option key={id} value={id}>
                            {p.name} ·{" "}
                            {money(s.costOverrides[id as PackageId] ?? p.cost)}
                          </option>
                        ))}
                      </select>
                      <p className="field-help">
                        {packages[s.packages[selected] ?? "none"].description}
                      </p>
                      {(s.packages[selected] ?? "none") !== "none" && (
                        <label className="cost-input">
                          Package cost allowance ($)
                          <input
                            type="number"
                            min="0"
                            max="250000"
                            value={
                              s.costOverrides[s.packages[selected]] ??
                              packages[s.packages[selected]].cost
                            }
                            onChange={(e) =>
                              set("costOverrides", {
                                ...s.costOverrides,
                                [s.packages[selected]]: Math.max(
                                  0,
                                  Math.min(250000, +e.target.value),
                                ),
                              })
                            }
                          />
                          <small>
                            Applies to this package at every link. Update after
                            supplier quotes.
                          </small>
                        </label>
                      )}
                    </div>
                    <div className="detail-numbers">
                      <div>
                        <span>Allocated arrivals</span>
                        <b>{num(selectedResult.visitors)}</b>
                      </div>
                      <div>
                        <span>Exposure avoided</span>
                        <b>
                          {num(selectedResult.saved / 60)}{" "}
                          <small>person-hrs</small>
                        </b>
                      </div>
                      <div>
                        <span>Effective shade</span>
                        <b>{Math.round(selectedResult.coverage * 100)}%</b>
                      </div>
                    </div>
                    <details>
                      <summary>
                        Edit this link’s assumptions <ChevronDown size={15} />
                      </summary>
                      <div className="compact-fields assumption-fields">
                        <label>
                          Demand weight
                          <input
                            aria-label="Demand weight"
                            type="number"
                            min="0"
                            max="200000"
                            value={selectedCorridor.visitors}
                            onChange={(e) =>
                              edit(
                                "visitors",
                                Math.max(0, Math.min(200000, +e.target.value)),
                              )
                            }
                          />
                        </label>
                        <label>
                          Walk time (min)
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={selectedCorridor.walkMinutes}
                            onChange={(e) =>
                              edit(
                                "walkMinutes",
                                Math.max(0, Math.min(120, +e.target.value)),
                              )
                            }
                          />
                        </label>
                        <label>
                          Queue time (min)
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={selectedCorridor.queueMinutes}
                            onChange={(e) =>
                              edit(
                                "queueMinutes",
                                Math.max(0, Math.min(120, +e.target.value)),
                              )
                            }
                          />
                        </label>
                        <label>
                          Existing shade (%)
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={Math.round(selectedCorridor.shade * 100)}
                            onChange={(e) =>
                              edit(
                                "shade",
                                Math.max(0, Math.min(100, +e.target.value)) /
                                  100,
                              )
                            }
                          />
                        </label>
                        <label>
                          Everyday local use (%)
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={Math.round(
                              selectedCorridor.residentShare * 100,
                            )}
                            onChange={(e) =>
                              edit(
                                "residentShare",
                                Math.max(0, Math.min(100, +e.target.value)) /
                                  100,
                              )
                            }
                          />
                        </label>
                        <label>
                          Daily resident passages
                          <input
                            type="number"
                            min="0"
                            max="100000"
                            value={selectedCorridor.dailyResidents}
                            onChange={(e) =>
                              edit(
                                "dailyResidents",
                                Math.max(0, Math.min(100000, +e.target.value)),
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="field-help">
                        Demand weights allocate the total arrival visitors
                        across links. Each visitor uses one link in this model,
                        avoiding double counting.
                      </p>
                    </details>
                    <p className="source-note">
                      <MapPin size={14} />
                      {selectedCorridor.note}
                    </p>
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">04 / COMPARE THE OUTCOME</span>
                      <h2>Less time in the sun</h2>
                    </div>
                    <span className="tag">Person-hours</span>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={bars}
                        layout="vertical"
                        margin={{ left: 0, right: 20, top: 5, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#e6eced"
                        />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={102}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(value) =>
                            num(Number(value)) + " person-hours"
                          }
                          cursor={{ fill: "#f3f6f7" }}
                        />
                        <Bar
                          dataKey="Baseline"
                          fill="#cfdcdb"
                          radius={[0, 3, 3, 0]}
                        />
                        <Bar
                          dataKey="With plan"
                          fill="#087a66"
                          radius={[0, 3, 3, 0]}
                        />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-foot">
                    <b>{num(r.base / 60)}</b> baseline <ArrowRight size={14} />
                    <b>{num(r.after / 60)}</b> with your plan{" "}
                    <span>person-hours / arrival</span>
                  </div>
                </section>
              </div>
              <section className="panel decision-table">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">THE INVESTMENT BRIEF</span>
                    <h2>Six links. One accountable plan.</h2>
                  </div>
                  <div className="button-row">
                    <button
                      className="text-button"
                      onClick={() => {
                        setCompare(structuredClone(s));
                        setNotice(
                          "Current plan pinned for comparison. Change inputs or optimize to compare.",
                        );
                      }}
                    >
                      <Plus size={15} />
                      Pin comparison
                    </button>
                    <button
                      className="text-button"
                      onClick={() =>
                        download(
                          "shadeshift-scenario.csv",
                          toCsv(s),
                          "text/csv",
                        )
                      }
                    >
                      <Download size={15} />
                      CSV
                    </button>
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Candidate link</th>
                        <th>Intervention</th>
                        <th>Investment</th>
                        <th>Sun hours avoided</th>
                        <th>Cost / hour avoided</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.rows.map((c, i) => (
                        <tr key={c.id} onClick={() => setSelected(c.id)}>
                          <td>
                            <span className="row-number">{i + 1}</span>
                            {c.name}
                          </td>
                          <td>{packages[c.package].name}</td>
                          <td>{money(c.cost)}</td>
                          <td>{num(c.saved / 60)}</td>
                          <td>
                            {c.saved ? money(c.cost / (c.saved / 60)) : "n/a"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="table-note">
                  Costs are planning allowances for one arrival window, not
                  supplier quotes. Repeated staffing costs appear in Legacy &
                  delivery.
                </p>
              </section>
              {compare && (
                <section className="panel comparison">
                  <div className="panel-heading">
                    <h2>Pinned plan vs. current plan</h2>
                    <button
                      className="text-button"
                      onClick={() => setCompare(null)}
                    >
                      <X size={16} />
                      Clear
                    </button>
                  </div>
                  <div className="compare-grid">
                    {[
                      {
                        label: "Pinned plan",
                        data: evaluate(compare),
                        eventDays: compare.eventDays,
                      },
                      {
                        label: "Current plan",
                        data: r,
                        eventDays: s.eventDays,
                      },
                    ].map((p) => (
                      <div key={p.label}>
                        <span>{p.label}</span>
                        <b>{p.data.reduction.toFixed(1)}% exposure avoided</b>
                        <p>
                          {money(p.data.cost)} initial investment ·{" "}
                          {p.data.residentPercent.toFixed(0)}% community
                          allocation
                        </p>
                        <p>
                          {money(p.data.annualCost)} first-year allowance ·{" "}
                          {p.eventDays} event windows
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="table-note">
                    Optimization constrains initial investment. Repeated
                    staffing, refills and maintenance can change which plan fits
                    an annual budget.
                  </p>
                </section>
              )}
              <section className="panel sensitivity">
                <div>
                  <div className="eyebrow">STRESS-TEST THE ASSUMPTION</div>
                  <h2>What if the intervention underperforms?</h2>
                  <p>
                    Hold the chosen portfolio fixed and reduce both added shade
                    and queue improvement. This is a sensitivity range, not a
                    confidence interval.
                  </p>
                  <label className="slider-label" htmlFor="effectiveness">
                    Delivered effectiveness <b>{s.effectiveness}%</b>
                  </label>
                  <input
                    id="effectiveness"
                    className="slider"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={s.effectiveness}
                    onChange={(e) => set("effectiveness", +e.target.value)}
                  />
                </div>
                <div className="sensitivity-cases">
                  {sensitivity(s).map((c) => (
                    <div key={c.effectiveness}>
                      <span>{c.effectiveness}% delivered</span>
                      <b>{c.reduction.toFixed(1)}%</b>
                      <small>direct-sun exposure avoided</small>
                    </div>
                  ))}
                </div>
              </section>
              <div className="bottom-actions">
                <button
                  className="text-button"
                  onClick={() => {
                    setS(structuredClone(defaultScenario));
                    setNotice(
                      "Restored the example scenario. Saved plans are unchanged.",
                    );
                  }}
                >
                  <RotateCcw size={15} />
                  Reset example
                </button>
                <button
                  className="text-button"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload size={15} />
                  Import scenario JSON
                </button>
                <button
                  className="text-button"
                  onClick={() => navTo("evidence")}
                >
                  Read the model and limitations <ArrowUpRight size={15} />
                </button>
              </div>
            </>
          )}
          {tab === "atlas" && <CityAtlas onHouston={() => navTo("studio")} />}
          {tab === "evidence" && <Evidence />}
          {tab === "legacy" && (
            <>
              <div className="legacy-hero">
                <div>
                  <div className="eyebrow">
                    A REUSABLE ASSET, A REPEATABLE SERVICE
                  </div>
                  <h2>
                    The next event should start
                    <br />
                    with a better baseline.
                  </h2>
                  <p>
                    Plan installation, operations and reuse together. Keep
                    community benefit explicit and measure it after deployment.
                  </p>
                </div>
                <div className="legacy-big">
                  <b>{compact(r.legacy / 60)}</b>
                  <span>modeled resident sun-hours avoided / year</span>
                  <small>
                    {s.legacyDays} reuse days · assumed daily passages
                  </small>
                </div>
              </div>
              <div className="metrics">
                <div className="metric">
                  <span>First deployment</span>
                  <strong>{money(r.cost)}</strong>
                  <p>Reusable assets + one event staffing window</p>
                </div>
                <div className="metric">
                  <span>Annual maintenance allowance</span>
                  <strong>{money(r.maintenance)}</strong>
                  <p>Shade inspection + refill hub upkeep</p>
                </div>
                <div className="metric">
                  <span>First-year program cost</span>
                  <strong>{money(r.annualCost)}</strong>
                  <p>
                    Includes queue staffing + refill operations for{" "}
                    {s.eventDays} windows
                  </p>
                </div>
              </div>
              <div className="detail-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Cumulative exposure avoided</h2>
                    <span className="tag">Person-hours</span>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={years} margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4eaea" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis
                          tickFormatter={compact}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value) =>
                            num(Number(value)) + " person-hours"
                          }
                        />
                        <Legend />
                        <Line
                          dataKey="Event"
                          stroke="#d7914e"
                          strokeWidth={3}
                        />
                        <Line
                          dataKey="Community"
                          stroke="#087a66"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="table-note">
                    Linear scenario with constant use and full asset retention.
                    No growth, avoided illnesses, carbon savings or monetary
                    health benefits claimed.
                  </p>
                </section>
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Annual use assumptions</h2>
                  </div>
                  <div className="detail-body">
                    <div className="compact-fields">
                      <label>
                        Event arrival windows / year
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={s.eventDays}
                          onChange={(e) =>
                            set(
                              "eventDays",
                              Math.max(
                                1,
                                Math.min(365, Math.round(+e.target.value)),
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Community reuse days / year
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={s.legacyDays}
                          onChange={(e) =>
                            set(
                              "legacyDays",
                              Math.max(
                                0,
                                Math.min(365, Math.round(+e.target.value)),
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                    <label className="slider-label" htmlFor="legacy-sun">
                      Community sunlight factor{" "}
                      <b>{Math.round(s.legacySunlight * 100)}%</b>
                    </label>
                    <input
                      className="slider"
                      id="legacy-sun"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={s.legacySunlight}
                      onChange={(e) => set("legacySunlight", +e.target.value)}
                    />
                    <p>
                      Resident benefits count walking exposure only, with their
                      own sunlight factor. Event queue improvements do not
                      create a permanent neighborhood benefit.
                    </p>
                    <div className="note-box">
                      <Leaf size={20} />
                      <p>
                        Candidate community locations need an owner, permission,
                        an accessible path, maintenance funding and observed
                        demand before they become investment commitments.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <h2>A 30-day paid pilot</h2>
                  <span className="tag">Proposed, not contracted</span>
                </div>
                <div className="pilot-steps">
                  {[
                    {
                      n: "01",
                      title: "Ground-truth the walk",
                      days: "Days 1–7",
                      body: "Walk the links with venue, transit and accessibility staff. Count pedestrians and queues in 15-minute intervals. Audit shade at the event hour.",
                    },
                    {
                      n: "02",
                      title: "Choose and permit",
                      days: "Days 8–14",
                      body: "Import validated inputs. Obtain supplier quotes, wind ratings, egress and right-of-way approvals. Agree on the portfolio and deployment owner.",
                    },
                    {
                      n: "03",
                      title: "Deploy and measure",
                      days: "Days 15–23",
                      body: "Install a reversible trial. Compare shade and queue duration against matched control windows. Record weather and operating conditions.",
                    },
                    {
                      n: "04",
                      title: "Review and reuse",
                      days: "Days 24–30",
                      body: "Publish measured changes alongside modeled estimates. Document failures, resident feedback and upkeep. Decide whether to renew.",
                    },
                  ].map((p) => (
                    <div key={p.n}>
                      <span className="step-num">{p.n}</span>
                      <small>{p.days}</small>
                      <h3>{p.title}</h3>
                      <p>{p.body}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="business-strip">
                <div>
                  <span className="eyebrow">THE CUSTOMER</span>
                  <h3>Venue & event operations</h3>
                  <p>
                    One accountable buyer, recurring events, and a budget for
                    the next deployment.
                  </p>
                </div>
                <div>
                  <span className="eyebrow">THE COMMERCIAL HYPOTHESIS</span>
                  <h3>$5,000 pilot · $6,000 / year</h3>
                  <p>
                    Planning software and review support. Hardware, staffing and
                    permits remain separate. Pricing needs customer validation.
                  </p>
                </div>
                <div>
                  <span className="eyebrow">THE REASON TO RENEW</span>
                  <h3>An evidence trail that improves</h3>
                  <p>
                    Observed queue times, actual costs, and verified shade
                    performance make the next plan more credible.
                  </p>
                </div>
              </section>
            </>
          )}
          {tab === "plans" && (
            <>
              {!user ? (
                <section className="empty-state">
                  <FolderOpen size={40} />
                  <h2>Your plans, available across sessions.</h2>
                  <p>
                    Explore every scenario without an account. Sign in with your
                    email to save plans privately.
                  </p>
                  <button className="primary" onClick={signIn}>
                    Sign in to your account <ArrowUpRight size={16} />
                  </button>
                </section>
              ) : (
                <>
                  <div className="plan-toolbar">
                    <span>{saved.length} recent saved plans</span>
                    <div className="button-row">
                      <button
                        className="secondary"
                        onClick={() => fileInput.current?.click()}
                      >
                        <Upload size={15} />
                        Import JSON
                      </button>
                      <button
                        className="primary"
                        onClick={() => setSaveDialog(true)}
                      >
                        <Plus size={16} />
                        Save current plan
                      </button>
                    </div>
                  </div>
                  {busy && <p role="status">Loading your workspace…</p>}
                  {savedError && (
                    <div className="notice error" role="alert">
                      {savedError}
                      <button onClick={loadPlans}>Try again</button>
                    </div>
                  )}
                  {!busy && !savedError && saved.length === 0 && (
                    <section className="empty-state">
                      <FolderOpen size={40} />
                      <h2>Your first plan starts in the studio.</h2>
                      <p>
                        Save a scenario to preserve every input and intervention
                        choice.
                      </p>
                      <button
                        className="primary"
                        onClick={() => navTo("studio")}
                      >
                        Open scenario studio <ArrowRight size={16} />
                      </button>
                    </section>
                  )}
                  <div className="saved-grid">
                    {saved.map((p) => {
                      const pr = evaluate(p.scenario);
                      return (
                        <article className="panel saved-card" key={p.id}>
                          <span className="tag">Private plan</span>
                          <h2>{p.name}</h2>
                          <p>
                            {money(pr.cost)} investment ·{" "}
                            {pr.reduction.toFixed(1)}% exposure avoided
                          </p>
                          <small>
                            Saved {new Date(p.updated_at).toLocaleString()}
                          </small>
                          {p.modelVersion !== MODEL_VERSION && (
                            <p className="danger">
                              Requires model {p.modelVersion}. Open with the
                              matching release.
                            </p>
                          )}
                          <div className="button-row">
                            <button
                              className="primary"
                              disabled={p.modelVersion !== MODEL_VERSION}
                              onClick={() => {
                                if (p.modelVersion !== MODEL_VERSION) {
                                  setNotice(
                                    "This saved plan requires model " +
                                      p.modelVersion,
                                  );
                                  return;
                                }
                                setS(p.scenario);
                                navTo("studio");
                                setNotice(
                                  "Saved plan loaded. Changes create a new version when you save.",
                                );
                              }}
                            >
                              Open plan <ArrowRight size={16} />
                            </button>
                            <button
                              className="icon-button"
                              aria-label={`Delete ${p.name}`}
                              disabled={busy}
                              onClick={() => removePlan(p.id)}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
          <footer>
            <span>
              ShadeShift <b>·</b> A cooler last mile. An enduring city benefit.
            </span>
            <button onClick={() => navTo("evidence")}>
              Model {MODEL_VERSION} · Sources & limitations{" "}
              <ArrowUpRight size={13} />
            </button>
          </footer>
        </div>
      </main>
      <input
        ref={fileInput}
        aria-label="Import scenario file"
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => importPlan(e.target.files?.[0])}
      />
      {authDialog && (
        <AuthDialog
          onClose={closeAuth}
          onSuccess={() => {
            setAuthDialog(false);
            setSaveDialog(true);
            setNotice("Signed in. Your scenario is ready to save.");
          }}
        />
      )}
      {saveDialog && (
        <div className="modal-backdrop" onClick={() => setSaveDialog(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close save dialog"
              onClick={() => setSaveDialog(false)}
            >
              <X size={20} />
            </button>
            <Save size={28} />
            <h2 id="save-title">Save an accountable plan.</h2>
            <p>
              Keep the inputs, intervention choices and model version together
              in your private workspace.
            </p>
            <label>
              Plan name
              <input
                autoFocus
                maxLength={100}
                value={s.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <button
              className="primary"
              disabled={busy || !s.name.trim()}
              onClick={savePlan}
            >
              {busy ? "Saving…" : "Save plan"}
              <Check size={16} />
            </button>
          </section>
        </div>
      )}
      {guide && (
        <div className="modal-backdrop" onClick={() => setGuide(false)}>
          <section
            className="modal guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close demo guide"
              onClick={() => setGuide(false)}
            >
              <X size={20} />
            </button>
            <span className="eyebrow">A TWO-MINUTE PRODUCT TOUR</span>
            <h2 id="guide-title">One budget. A cooler arrival.</h2>
            <ol>
              <li>
                <b>Start with a place.</b> Inspect the Houston map. Orange dots
                are real 2020 observations; numbered lines are candidate
                connectors.
              </li>
              <li>
                <b>Make a tradeoff.</b> Set a $75,000 budget and a 25% community
                allocation. Optimize the portfolio.
              </li>
              <li>
                <b>Challenge the result.</b> Change a queue time or reduce
                delivered effectiveness. Watch the result update.
              </li>
              <li>
                <b>Make it actionable.</b> Export the decision table, save the
                plan, and open Legacy & delivery for the operating costs.
              </li>
            </ol>
            <button
              className="primary"
              onClick={() => {
                setGuide(false);
                navTo("studio");
              }}
            >
              Explore the studio <ArrowRight size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
