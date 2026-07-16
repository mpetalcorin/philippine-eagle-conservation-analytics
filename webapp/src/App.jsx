import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Bird,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Dna,
  Download,
  ExternalLink,
  Filter,
  Github,
  HeartPulse,
  Leaf,
  MapPinned,
  Menu,
  Microscope,
  Mountain,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Trees,
  Users,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import data from './generated/data.json'

const COLORS = {
  navy: '#0d2f5f',
  green: '#1f6b45',
  moss: '#6f8f3d',
  gold: '#d59a2a',
  red: '#c33d36',
  blue: '#3777b8',
  teal: '#2c8a87',
  brown: '#7b5132',
  pale: '#eef5ef',
}

const RISK_COLORS = {
  Low: '#2c8a57',
  Moderate: '#c4a129',
  High: '#df7f25',
  Critical: '#c33d36',
}

const SCENARIO_COLORS = {
  'Current pressure': '#6b7280',
  'Habitat protection': '#3777b8',
  'Anti-persecution': '#d59a2a',
  'Integrated conservation': '#1f6b45',
  'High-pressure future': '#c33d36',
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'territories', label: 'Territories', icon: MapPinned },
  { id: 'breeding', label: 'Breeding', icon: Bird },
  { id: 'population', label: 'Population', icon: HeartPulse },
  { id: 'genomics', label: 'Genomics', icon: Dna },
  { id: 'interventions', label: 'Interventions', icon: Target },
  { id: 'evidence', label: 'Evidence', icon: BookOpen },
]

const fmt = (value, digits = 0) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const pct = (value, digits = 0) => `${fmt(value, digits)}%`

function MetricCard({ icon: Icon, label, value, detail, tone = 'green' }) {
  return (
    <motion.article
      className={`metric-card tone-${tone}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="metric-icon"><Icon size={20} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </motion.article>
  )
}

function Panel({ title, subtitle, children, action, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      {label !== undefined && <strong>{label}</strong>}
      {payload.map((item) => (
        <div key={item.dataKey || item.name}>
          <span className="dot" style={{ background: item.color }} />
          <span>{item.name}: </span>
          <b>{typeof item.value === 'number' ? fmt(item.value, item.value < 10 ? 2 : 0) : item.value}</b>
        </div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={16} /> Literature-benchmarked synthetic conservation science</div>
        <h1>Philippine Eagle Conservation Analytics</h1>
        <p>
          An interactive systems-level view of habitat, territory risk, breeding performance,
          population viability, genetic diversity, and intervention priorities for
          <em> Pithecophaga jefferyi</em>.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="https://github.com/mpetalcorin/philippine-eagle-conservation-analytics" target="_blank" rel="noreferrer">
            <Github size={18} /> View GitHub <ExternalLink size={14} />
          </a>
          <a className="button secondary" href="/downloads/philippine_eagle_conservation_analytics.ipynb" download>
            <Download size={18} /> Download notebook
          </a>
        </div>
        <div className="hero-note">
          <ShieldCheck size={18} /> No real nest coordinates, telemetry tracks, or individual genotypes are exposed.
        </div>
      </div>
      <div className="hero-visual">
        <img src="/figures/philippine_eagle_guardian_of_rainforests.png" alt="Philippine eagle conservation infographic" />
      </div>
    </section>
  )
}

function Overview() {
  const [scenario, setScenario] = useState('Integrated conservation')
  const pva = data.pvaQuantiles.filter((row) => row.scenario === scenario)
  const riskOrder = ['Critical', 'High', 'Moderate', 'Low']
  const risks = riskOrder.map((name) => data.riskDistribution.find((x) => x.name === name) || { name, count: 0 })

  return (
    <div className="page-stack">
      <Hero />
      <div className="metric-grid">
        <MetricCard icon={Bird} label="Estimated breeding pairs" value={fmt(data.headline.breedingPairs)} detail="Published global estimate" tone="navy" />
        <MetricCard icon={Trees} label="Area of habitat" value={`${fmt(data.headline.habitatKm2)} km²`} detail={`${pct(data.headline.protectedPct)} reported as protected`} />
        <MetricCard icon={Mountain} label="Median home range" value={`${fmt(data.headline.medianHomeRangeKm2)} km²`} detail={`${fmt(data.headline.medianCoreRangeKm2)} km² median core`} tone="gold" />
        <MetricCard icon={Network} label="Space-time outside core" value={pct(data.headline.outsideCorePct)} detail="Exposure beyond core habitat" tone="red" />
      </div>

      <div className="two-column">
        <Panel
          title="Population trajectory explorer"
          subtitle="Stochastic projection of adult females under alternative conservation conditions."
          action={
            <SelectField label="Scenario" value={scenario} onChange={setScenario}>
              {data.pvaSummary.map((row) => <option key={row.scenario}>{row.scenario}</option>)}
            </SelectField>
          }
        >
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pva} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvaArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SCENARIO_COLORS[scenario]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={SCENARIO_COLORS[scenario]} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={44} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="p90" name="90th percentile" stroke="none" fill="url(#pvaArea)" />
                <Area type="monotone" dataKey="p10" name="10th percentile" stroke="none" fill="#ffffff" fillOpacity={0.8} />
                <Line type="monotone" dataKey="median" name="Median" stroke={SCENARIO_COLORS[scenario]} strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="interpretation">
            <strong>Interpretation:</strong> the simulation indicates that integrated habitat protection and anti-persecution measures generate the strongest long-term recovery, whereas a high-pressure future drives the population close to the operational risk threshold.
          </p>
        </Panel>

        <Panel title="Territory risk profile" subtitle="Distribution across 392 simulated breeding territories.">
          <div className="chart-medium">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={risks} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {risks.map((entry) => <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="bottom" height={30} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="risk-list">
            {risks.map((item) => (
              <div key={item.name}>
                <span><i style={{ background: RISK_COLORS[item.name] }} /> {item.name}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="From molecule to landscape" subtitle="A systems framework linking molecular variation to population persistence.">
        <div className="systems-flow">
          {[
            { icon: Dna, title: 'Genomic resilience', text: 'Heterozygosity, runs-of-homozygosity proxies, haplotypes, and pairing compatibility.' },
            { icon: Bird, title: 'Breeding biology', text: 'Slow reproductive turnover makes every successful nesting cycle biologically consequential.' },
            { icon: Trees, title: 'Habitat integrity', text: 'Forest structure, canopy continuity, prey availability, and disturbance shape territory quality.' },
            { icon: HeartPulse, title: 'Population persistence', text: 'Demography integrates local pressures into long-term extinction and recovery trajectories.' },
          ].map((item, index) => (
            <div className="system-node" key={item.title}>
              <div className="system-icon"><item.icon size={22} /></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {index < 3 && <ChevronRight className="system-arrow" size={22} />}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Territories() {
  const [island, setIsland] = useState('All')
  const [risk, setRisk] = useState('All')
  const [protectedOnly, setProtectedOnly] = useState(false)

  const filtered = useMemo(() => data.territories.filter((row) =>
    (island === 'All' || row.island === island) &&
    (risk === 'All' || row.risk_class === risk) &&
    (!protectedOnly || row.protected)
  ), [island, risk, protectedOnly])

  const tableRows = [...filtered].sort((a, b) => b.risk_score - a.risk_score).slice(0, 18)
  const meanRisk = filtered.length ? filtered.reduce((sum, row) => sum + row.risk_score, 0) / filtered.length : 0
  const protection = filtered.length ? 100 * filtered.filter((row) => row.protected).length / filtered.length : 0

  return (
    <div className="page-stack">
      <div className="page-title">
        <div><span className="eyebrow"><MapPinned size={16} /> Territory intelligence</span><h1>Landscape risk and protection gaps</h1></div>
        <p>Filter the synthetic territory atlas and inspect how fragmentation, pressure, movement demand, and protection status interact.</p>
      </div>
      <div className="filter-bar">
        <Filter size={18} />
        <SelectField label="Island" value={island} onChange={setIsland}>
          {['All', 'Mindanao', 'Luzon', 'Samar', 'Leyte'].map((x) => <option key={x}>{x}</option>)}
        </SelectField>
        <SelectField label="Risk class" value={risk} onChange={setRisk}>
          {['All', 'Critical', 'High', 'Moderate', 'Low'].map((x) => <option key={x}>{x}</option>)}
        </SelectField>
        <label className="check-field"><input type="checkbox" checked={protectedOnly} onChange={(e) => setProtectedOnly(e.target.checked)} /> Protected only</label>
      </div>
      <div className="metric-grid compact">
        <MetricCard icon={MapPinned} label="Territories shown" value={fmt(filtered.length)} tone="navy" />
        <MetricCard icon={Activity} label="Mean risk score" value={fmt(meanRisk, 1)} tone={meanRisk > 60 ? 'red' : 'gold'} />
        <MetricCard icon={ShieldCheck} label="Protected" value={pct(protection, 1)} />
        <MetricCard icon={Mountain} label="Mean home range" value={`${fmt(filtered.length ? filtered.reduce((s, x) => s + x.home_range_95_km2, 0) / filtered.length : 0, 1)} km²`} tone="gold" />
      </div>

      <div className="two-column wide-left">
        <Panel title="Fragmentation versus movement demand" subtitle="Larger home ranges under fragmented conditions may signal greater energetic and exposure costs.">
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
                <XAxis type="number" dataKey="fragmentation_index" name="Fragmentation" domain={[0, 1]} tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="home_range_95_km2" name="Home range" unit=" km²" tick={{ fontSize: 12 }} width={50} />
                <ZAxis type="number" dataKey="risk_score" range={[30, 150]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltip />} />
                <Scatter data={filtered} name="Territories">
                  {filtered.map((row) => <Cell key={row.territory_id} fill={RISK_COLORS[row.risk_class]} fillOpacity={0.72} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Island comparison" subtitle="Average landscape condition by island.">
          <div className="island-cards">
            {data.islandSummary.map((row) => (
              <article key={row.island}>
                <div><strong>{row.island}</strong><span>{row.territories} territories</span></div>
                <dl>
                  <div><dt>Mean risk</dt><dd>{fmt(row.meanRisk, 1)}</dd></div>
                  <div><dt>Protected</dt><dd>{pct(row.protectedPct, 1)}</dd></div>
                  <div><dt>Forest integrity</dt><dd>{pct(row.meanForestIntegrity * 100, 1)}</dd></div>
                  <div><dt>Home range</dt><dd>{fmt(row.meanHomeRange, 1)} km²</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Highest-priority territories" subtitle="Ranked by composite risk score after applying the active filters.">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Territory</th><th>Island</th><th>Risk</th><th>Forest</th><th>Fragmentation</th><th>Human pressure</th><th>Protected</th><th>Recommended action</th></tr></thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.territory_id}>
                  <td><strong>{row.territory_id}</strong></td><td>{row.island}</td>
                  <td><span className="risk-pill" style={{ background: `${RISK_COLORS[row.risk_class]}18`, color: RISK_COLORS[row.risk_class] }}>{row.risk_class} · {fmt(row.risk_score, 1)}</span></td>
                  <td>{pct(row.forest_integrity * 100, 0)}</td><td>{fmt(row.fragmentation_index, 2)}</td><td>{fmt(row.human_pressure, 2)}</td>
                  <td>{row.protected ? <CheckCircle2 size={18} color={COLORS.green} /> : 'No'}</td><td>{row.recommended_action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function Breeding() {
  const totalAttempts = data.breedingByYear.reduce((s, x) => s + x.attempted, 0)
  const totalFledged = data.breedingByYear.reduce((s, x) => s + x.fledged, 0)
  const totalHatched = data.breedingByYear.reduce((s, x) => s + x.hatched, 0)

  return (
    <div className="page-stack">
      <div className="page-title">
        <div><span className="eyebrow"><Bird size={16} /> Reproductive ecology</span><h1>Breeding performance and bottlenecks</h1></div>
        <p>Biennial synthetic histories reflect the species’ slow life history and the cumulative effects of habitat and disturbance.</p>
      </div>
      <div className="metric-grid compact">
        <MetricCard icon={Bird} label="Breeding attempts" value={fmt(totalAttempts)} tone="navy" />
        <MetricCard icon={Leaf} label="Hatched" value={fmt(totalHatched)} detail={`${pct(100 * totalHatched / totalAttempts, 1)} of attempts`} />
        <MetricCard icon={Sparkles} label="Fledged" value={fmt(totalFledged)} detail={`${pct(100 * totalFledged / totalAttempts, 1)} of attempts`} tone="gold" />
        <MetricCard icon={ShieldCheck} label="Parental strategy" value="One egg" detail="Typically one breeding cycle every two years" tone="red" />
      </div>
      <div className="two-column">
        <Panel title="Breeding outcomes through time" subtitle="Attempt, hatch, and fledging counts in each simulated breeding year.">
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.breedingByYear} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line dataKey="attempted" name="Attempts" stroke={COLORS.navy} strokeWidth={2.5} />
                <Line dataKey="hatched" name="Hatched" stroke={COLORS.gold} strokeWidth={2.5} />
                <Line dataKey="fledged" name="Fledged" stroke={COLORS.green} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Fledging performance by island" subtitle="Rates are descriptive outputs from the simulated histories, not field estimates.">
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.breedingByIsland} layout="vertical" margin={{ left: 10, right: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
                <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="island" width={72} tick={{ fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="hatchRate" name="Hatch rate" fill={COLORS.gold} radius={[0, 5, 5, 0]} />
                <Bar dataKey="fledgingRate" name="Fledging rate" fill={COLORS.green} radius={[0, 5, 5, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <Panel title="Biological interpretation" subtitle="Why a slow life history magnifies disturbance.">
        <div className="callout-grid">
          <div className="callout"><span>1</span><div><h3>Low reproductive throughput</h3><p>One egg and prolonged parental care limit how rapidly lost adults or failed nests can be replaced.</p></div></div>
          <div className="callout"><span>2</span><div><h3>Energetic coupling</h3><p>Fragmentation can lengthen foraging movements, increasing energy expenditure and exposure to roads, people, and prey scarcity.</p></div></div>
          <div className="callout"><span>3</span><div><h3>Compounding risk</h3><p>Habitat loss, persecution, and demographic stochasticity interact nonlinearly, so integrated intervention is more effective than isolated action.</p></div></div>
        </div>
      </Panel>
    </div>
  )
}

function Population() {
  const [forestScenario, setForestScenario] = useState('Current pressure')
  const forestRows = data.forestProjection.filter((row) => row.scenario === forestScenario)
  return (
    <div className="page-stack">
      <div className="page-title">
        <div><span className="eyebrow"><HeartPulse size={16} /> Population viability</span><h1>Future habitat and demographic trajectories</h1></div>
        <p>Scenario analysis helps identify which combinations of threats and interventions most strongly alter long-term persistence.</p>
      </div>
      <Panel
        title="Projected area of habitat"
        subtitle="Remaining area of habitat under alternative annual pressure assumptions."
        action={<SelectField label="Scenario" value={forestScenario} onChange={setForestScenario}>{data.pvaSummary.map((x) => <option key={x.scenario}>{x.scenario}</option>)}</SelectField>}
      >
        <div className="chart-large">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forestRows} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
              <defs><linearGradient id="forestArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={SCENARIO_COLORS[forestScenario]} stopOpacity={0.35} /><stop offset="95%" stopColor={SCENARIO_COLORS[forestScenario]} stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 12 }} width={46} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="remaining_aoh_km2" name="Remaining habitat km²" stroke={SCENARIO_COLORS[forestScenario]} strokeWidth={3} fill="url(#forestArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel title="Forty-year scenario comparison" subtitle="Median adult females and operational risk at year 40.">
        <div className="scenario-grid">
          {data.pvaSummary.map((row) => (
            <article key={row.scenario} style={{ borderTopColor: SCENARIO_COLORS[row.scenario] }}>
              <span>{row.scenario}</span>
              <strong>{fmt(row.median_adult_females_y40)}</strong>
              <small>median adult females in year 40</small>
              <div className="interval">95% interval: {fmt(row.lower95)}–{fmt(row.upper95)}</div>
              <div className="risk-meter"><div style={{ width: `${Math.min(100, row.prob_below50_pct)}%`, background: SCENARIO_COLORS[row.scenario] }} /></div>
              <b>{pct(row.prob_below50_pct, 1)} probability below 50</b>
            </article>
          ))}
        </div>
      </Panel>
      <div className="insight-banner"><Trees size={26} /><div><strong>Management implication</strong><p>Protecting forest alone improves trajectories, but the strongest response occurs when habitat protection is combined with direct reduction of persecution and other human pressures.</p></div></div>
    </div>
  )
}

function Genomics() {
  const meanHet = data.genomics.reduce((s, x) => s + x.heterozygosity, 0) / data.genomics.length
  const meanRoh = data.genomics.reduce((s, x) => s + x.ROH_fraction_proxy, 0) / data.genomics.length
  return (
    <div className="page-stack">
      <div className="page-title">
        <div><span className="eyebrow"><Dna size={16} /> Conservation genomics</span><h1>Genetic diversity and pairing intelligence</h1></div>
        <p>Synthetic individual-level data illustrate how diversity, relatedness proxies, and mitochondrial representation can support managed conservation.</p>
      </div>
      <div className="metric-grid compact">
        <MetricCard icon={Dna} label="Individuals modelled" value={fmt(data.genomics.length)} tone="navy" />
        <MetricCard icon={Microscope} label="Mean heterozygosity" value={meanHet.toExponential(2)} detail="Genome-wide synthetic benchmark" />
        <MetricCard icon={Network} label="Mean ROH proxy" value={fmt(meanRoh, 3)} detail="Lower values indicate less autozygosity" tone="gold" />
        <MetricCard icon={Users} label="Optimised pairs" value={fmt(data.pairings.length)} detail="Compatibility-ranked illustrative plan" tone="red" />
      </div>
      <div className="two-column">
        <Panel title="Heterozygosity versus autozygosity proxy" subtitle="Each point represents one synthetic individual.">
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
                <XAxis type="number" dataKey="heterozygosity" name="Heterozygosity" tickFormatter={(v) => v.toExponential(1)} tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="ROH_fraction_proxy" name="ROH proxy" tick={{ fontSize: 12 }} width={50} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltip />} />
                <Scatter data={data.genomics} fill={COLORS.blue} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Mitochondrial haplotype representation" subtitle="Counts among the synthetic mitochondrial sample.">
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.haplotypeSummary} margin={{ top: 10, right: 10, left: 0, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
                <XAxis dataKey="haplotype" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Individuals" fill={COLORS.teal} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <Panel title="Illustrative optimised pairing plan" subtitle="Pairs are selected from synthetic genetic axes and should not be interpreted as recommendations for real animals.">
        <div className="pair-grid">
          {data.pairings.map((pair, index) => (
            <article key={`${pair.female_id}-${pair.male_id}`}>
              <span>#{index + 1}</span>
              <div><strong>{pair.female_id}</strong><small>{pair.female_island} female</small></div>
              <ChevronRight size={18} />
              <div><strong>{pair.male_id}</strong><small>{pair.male_island} male</small></div>
              <b>{fmt(pair.pair_score, 2)}</b>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Interventions() {
  const maxBudget = Math.ceil(Math.max(...data.portfolio.map((x) => x.cumulative_cost)))
  const [budget, setBudget] = useState(Math.min(150, maxBudget))
  const selected = data.portfolio.filter((x) => x.cumulative_cost <= budget)
  const totalBenefit = selected.reduce((s, x) => s + x.expected_risk_reduction, 0)
  const islands = new Set(selected.map((x) => x.island)).size
  const topRows = selected.slice(0, 20)

  return (
    <div className="page-stack">
      <div className="page-title">
        <div><span className="eyebrow"><Target size={16} /> Decision support</span><h1>Budget-constrained intervention portfolio</h1></div>
        <p>Explore how a finite conservation budget can be allocated to the highest expected risk reduction per unit cost.</p>
      </div>
      <Panel title="Set the illustrative budget" subtitle="Cost units are synthetic and are not Philippine peso or operational estimates.">
        <div className="budget-control">
          <CircleDollarSign size={26} />
          <div><input type="range" min="3" max={maxBudget} step="3" value={budget} onChange={(e) => setBudget(Number(e.target.value))} /><div><span>3 units</span><strong>{fmt(budget)} units selected</strong><span>{fmt(maxBudget)} units</span></div></div>
        </div>
      </Panel>
      <div className="metric-grid compact">
        <MetricCard icon={Target} label="Territories funded" value={fmt(selected.length)} tone="navy" />
        <MetricCard icon={Activity} label="Expected risk reduction" value={fmt(totalBenefit, 1)} detail="Summed synthetic benefit units" />
        <MetricCard icon={MapPinned} label="Islands represented" value={`${islands} / 4`} tone="gold" />
        <MetricCard icon={CircleDollarSign} label="Budget used" value={fmt(selected.at(-1)?.cumulative_cost || 0)} detail={`of ${fmt(budget)} available units`} tone="red" />
      </div>
      <div className="two-column">
        <Panel title="Action portfolio" subtitle="Total expected benefit by intervention class.">
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.actionSummary} layout="vertical" margin={{ left: 25, right: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4de" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="action" width={170} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="benefit" name="Expected risk reduction" fill={COLORS.green} radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Conservation archetypes" subtitle="Territory clusters translate multidimensional pressures into management language.">
          <div className="archetype-list">
            {data.archetypeSummary.sort((a, b) => b.count - a.count).map((item, index) => (
              <div key={item.name}><span className="rank">{index + 1}</span><div><strong>{item.name}</strong><div className="bar-track"><div style={{ width: `${100 * item.count / Math.max(...data.archetypeSummary.map((x) => x.count))}%` }} /></div></div><b>{item.count}</b></div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Funded priorities" subtitle="Top-ranked territories within the current budget.">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Territory</th><th>Island</th><th>Risk</th><th>Action</th><th>Cost</th><th>Benefit</th><th>Benefit/cost</th></tr></thead>
            <tbody>{topRows.map((row, index) => <tr key={row.territory_id}><td>{index + 1}</td><td><strong>{row.territory_id}</strong></td><td>{row.island}</td><td>{fmt(row.risk_score, 1)}</td><td>{row.recommended_action}</td><td>{fmt(row.cost_units, 1)}</td><td>{fmt(row.expected_risk_reduction, 1)}</td><td><strong>{fmt(row.benefit_cost, 2)}</strong></td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function Evidence() {
  return (
    <div className="page-stack">
      <div className="page-title">
        <div><span className="eyebrow"><BookOpen size={16} /> Reproducibility and provenance</span><h1>Evidence, downloads, and responsible use</h1></div>
        <p>Published benchmarks calibrate the simulation, while all territory, breeding, and genomic records remain explicitly synthetic.</p>
      </div>
      <div className="download-grid">
        <a href="/downloads/philippine_eagle_conservation_analytics.ipynb" download><Download size={24} /><div><strong>Executed Jupyter notebook</strong><span>Simulation, analysis, diagnostics, and figures</span></div></a>
        <a href="https://github.com/mpetalcorin/philippine-eagle-conservation-analytics" target="_blank" rel="noreferrer"><Github size={24} /><div><strong>GitHub repository</strong><span>Code, datasets, figures, workflow, and citation metadata</span></div></a>
      </div>
      <Panel title="Literature benchmark register" subtitle="DOI links are provided where present in the source data.">
        <div className="table-wrap evidence-table">
          <table>
            <thead><tr><th>Domain</th><th>Study</th><th>Metric</th><th>Value</th><th>Uncertainty</th><th>DOI</th></tr></thead>
            <tbody>{data.benchmarks.map((row, index) => <tr key={`${row.metric}-${index}`}><td>{row.domain}</td><td>{row.study}</td><td><strong>{row.metric}</strong></td><td>{row.value} {row.unit}</td><td>{row.uncertainty}</td><td>{row.doi ? <a href={`https://doi.org/${row.doi}`} target="_blank" rel="noreferrer">{row.doi} <ExternalLink size={12} /></a> : '—'}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
      <div className="ethics-grid">
        <article><ShieldCheck size={26} /><h3>Privacy by design</h3><p>No real nest coordinates, telemetry tracks, field identities, or genotypes are displayed.</p></article>
        <article><Microscope size={26} /><h3>Simulation transparency</h3><p>Outputs demonstrate analytic methods and hypotheses, not direct estimates of individual animals or sites.</p></article>
        <article><Users size={26} /><h3>Human governance</h3><p>Models should support, never replace, field biologists, local communities, Indigenous knowledge, and conservation authorities.</p></article>
      </div>
    </div>
  )
}

function App() {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const pages = {
    overview: <Overview />, territories: <Territories />, breeding: <Breeding />, population: <Population />, genomics: <Genomics />, interventions: <Interventions />, evidence: <Evidence />,
  }

  const navigate = (id) => { setActive(id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate('overview')}>
          <span className="brand-mark"><Bird size={24} /></span>
          <span><strong>Philippine Eagle</strong><small>Conservation Analytics</small></span>
        </button>
        <nav className="desktop-nav">
          {NAV_ITEMS.map(({ id, label }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => navigate(id)}>{label}</button>)}
        </nav>
        <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></button>
      </header>

      <AnimatePresence>
        {mobileOpen && <motion.div className="mobile-drawer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <button className="drawer-close" onClick={() => setMobileOpen(false)}><X /></button>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={18} />{label}</button>)}
          </motion.aside>
        </motion.div>}
      </AnimatePresence>

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            {pages[active]}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer>
        <div><Bird size={18} /><strong>One Eagle. One Forest. One Future.</strong></div>
        <span>Open, reproducible, literature-benchmarked conservation analytics · Synthetic data only</span>
      </footer>
    </div>
  )
}

export default App
