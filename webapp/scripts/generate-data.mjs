import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'

const appRoot = path.resolve(import.meta.dirname, '..')
const repoRoot = path.resolve(appRoot, '..')

const readCsv = (relativePath) => {
  const filePath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(filePath)) throw new Error(`Missing source file: ${filePath}`)
  const text = fs.readFileSync(filePath, 'utf8')
  const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })
  if (parsed.errors.length) console.warn(parsed.errors.slice(0, 3))
  return parsed.data
}

const benchmarks = readCsv('data/benchmarks/literature_benchmarks.csv')
const territories = readCsv('data/synthetic/synthetic_territories.csv')
const breeding = readCsv('data/synthetic/synthetic_breeding_histories.csv')
const genomics = readCsv('data/synthetic/synthetic_nuclear_genomics.csv')
const haplotypes = readCsv('data/synthetic/synthetic_mitochondrial_haplotypes.csv')
const pairings = readCsv('data/synthetic/synthetic_optimised_pairing_plan.csv')
const pvaSummary = readCsv('results/pva_scenario_summary.csv')
const pvaQuantiles = readCsv('results/pva_trajectory_quantiles.csv')
const forestProjection = readCsv('results/forest_scenario_projection.csv')
const portfolio = readCsv('results/illustrative_intervention_portfolio.csv')
const benchmarkValidation = readCsv('results/benchmark_validation.csv')

const groupCount = (rows, key) => Object.entries(rows.reduce((acc, row) => {
  const value = row[key] ?? 'Unknown'
  acc[value] = (acc[value] || 0) + 1
  return acc
}, {})).map(([name, count]) => ({ name, count }))

const islandSummary = Object.entries(territories.reduce((acc, row) => {
  const key = row.island
  if (!acc[key]) acc[key] = { island: key, territories: 0, riskSum: 0, protected: 0, forestSum: 0, homeRangeSum: 0 }
  const x = acc[key]
  x.territories += 1
  x.riskSum += Number(row.risk_score || 0)
  x.protected += row.protected ? 1 : 0
  x.forestSum += Number(row.forest_integrity || 0)
  x.homeRangeSum += Number(row.home_range_95_km2 || 0)
  return acc
}, {})).map(([, x]) => ({
  island: x.island,
  territories: x.territories,
  meanRisk: x.riskSum / x.territories,
  protectedPct: 100 * x.protected / x.territories,
  meanForestIntegrity: x.forestSum / x.territories,
  meanHomeRange: x.homeRangeSum / x.territories,
}))

const breedingByYear = Object.values(breeding.reduce((acc, row) => {
  const key = String(row.year)
  if (!acc[key]) acc[key] = { year: row.year, attempted: 0, hatched: 0, fledged: 0 }
  acc[key].attempted += Number(row.attempted || 0)
  acc[key].hatched += Number(row.hatched || 0)
  acc[key].fledged += Number(row.fledged || 0)
  return acc
}, {})).sort((a, b) => a.year - b.year).map((x) => ({
  ...x,
  fledgingRate: x.attempted ? 100 * x.fledged / x.attempted : 0,
  hatchRate: x.attempted ? 100 * x.hatched / x.attempted : 0,
}))

const breedingByIsland = Object.values(breeding.reduce((acc, row) => {
  const key = row.island
  if (!acc[key]) acc[key] = { island: key, attempted: 0, hatched: 0, fledged: 0 }
  acc[key].attempted += Number(row.attempted || 0)
  acc[key].hatched += Number(row.hatched || 0)
  acc[key].fledged += Number(row.fledged || 0)
  return acc
}, {})).map((x) => ({
  ...x,
  fledgingRate: x.attempted ? 100 * x.fledged / x.attempted : 0,
  hatchRate: x.attempted ? 100 * x.hatched / x.attempted : 0,
}))

const haplotypeSummary = Object.entries(haplotypes.reduce((acc, row) => {
  const key = row.haplotype
  acc[key] = (acc[key] || 0) + 1
  return acc
}, {})).map(([haplotype, count]) => ({ haplotype, count })).sort((a, b) => b.count - a.count)

const actionSummary = Object.values(portfolio.reduce((acc, row) => {
  const key = row.recommended_action
  if (!acc[key]) acc[key] = { action: key, territories: 0, cost: 0, benefit: 0 }
  acc[key].territories += 1
  acc[key].cost += Number(row.cost_units || 0)
  acc[key].benefit += Number(row.expected_risk_reduction || 0)
  return acc
}, {})).map((x) => ({ ...x, benefitCost: x.cost ? x.benefit / x.cost : 0 }))

const archetypeSummary = groupCount(territories, 'archetype')
const riskDistribution = groupCount(territories, 'risk_class')

const benchmarkMap = Object.fromEntries(benchmarks.map((x) => [x.metric, x]))
const headline = {
  breedingPairs: benchmarkMap['Breeding pairs']?.value ?? 392,
  habitatKm2: benchmarkMap['Area of habitat']?.value ?? 28624,
  protectedPct: benchmarkMap['AOH protected']?.value ?? 32,
  medianHomeRangeKm2: benchmarkMap['Median 95% home range']?.value ?? 68,
  medianCoreRangeKm2: benchmarkMap['Median 50% core range']?.value ?? 13,
  outsideCorePct: benchmarkMap['Space-time outside core']?.value ?? 79,
}

const output = {
  generatedAt: new Date().toISOString(),
  headline,
  benchmarks,
  benchmarkValidation,
  territories,
  islandSummary,
  riskDistribution,
  archetypeSummary,
  breedingByYear,
  breedingByIsland,
  genomics,
  haplotypeSummary,
  pairings,
  pvaSummary,
  pvaQuantiles,
  forestProjection,
  portfolio,
  actionSummary,
}

const generatedDir = path.join(appRoot, 'src', 'generated')
fs.mkdirSync(generatedDir, { recursive: true })
fs.writeFileSync(path.join(generatedDir, 'data.json'), JSON.stringify(output))

const copies = [
  ['figures/infographic/philippine_eagle_guardian_of_rainforests.png', 'public/figures/philippine_eagle_guardian_of_rainforests.png'],
  ['figures/notebook/figure_02_home_ranges.png', 'public/figures/figure_2_ecological_benchmarks.png'],
  ['figures/notebook/figure_10_pva_trajectories.png', 'public/figures/figure_4_scenarios_pva.png'],
  ['figures/notebook/figure_12_heterozygosity.png', 'public/figures/figure_5_genomics.png'],
  ['notebooks/philippine_eagle_conservation_analytics.ipynb', 'public/downloads/philippine_eagle_conservation_analytics.ipynb'],
]
for (const [source, destination] of copies) {
  const src = path.join(repoRoot, source)
  const dst = path.join(appRoot, destination)
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  if (fs.existsSync(src)) fs.copyFileSync(src, dst)
}

console.log(`Generated web-app data from ${territories.length} territories and ${breeding.length} breeding records.`)
