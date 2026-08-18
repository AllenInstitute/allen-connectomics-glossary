// config.js — disciplines, datasets, categories, and the colour rules for the site.
// Plain data. Edit values freely; leave the "window.X =" wrappers alone so the
// files keep working when index.html is opened straight off disk (file://).

window.SITE = {
  title: "Allen Glossary",
  // shown in the footer; bump when you make a change worth flagging to readers
  revision: "2026-08",
  // listed in the footer as further reading. A definition that leans on one
  // particular source should carry its own "source" field instead.
  references: [
    { label: "SWDB databook",            url: "https://allenswdb.github.io/" },
    { label: "MICrONS Explorer",         url: "https://www.microns-explorer.org/" },
    { label: "CAVEclient documentation", url: "https://caveconnectome.github.io/CAVEclient/" },
    { label: "NWB",                      url: "https://nwb.org/" },
    { label: "AIND open data on S3",     url: "https://registry.opendata.aws/allen-nd-open-data/" },
  ],
  // the Community tab opens this in a new tab; clear it to drop the tab
  community: "https://community.brain-map.org/",
  // where "Suggest a change" files its issue. owner/name of the repository the
  // reader should be able to open an issue on; clear it to drop the button.
  repo: "AllenInstitute/allen-connectomics-glossary",
};

// The top-level lens. Everything below — categories, datasets, table groups —
// declares which discipline it belongs to, and "all" simply drops the filter.
window.DISCIPLINES = [
  { id: "connectomics", label: "Connectomics", blurb: "Electron-microscopy volumes, segmentation, and the CAVE annotation tables built on them." },
  { id: "physiology",   label: "Physiology",   blurb: "Two-photon and Neuropixels recordings of activity and behaviour, packaged as NWB." },
];

window.DATASETS = {
  /* ── connectomics ─────────────────────────────────────────────── */
  microns: {
    discipline: "connectomics",
    label: "MICrONS",
    blurb: "Cubic-millimetre serial-section EM of mouse visual cortex (VISp / VISal / VISrl), with matched two-photon calcium imaging.",
    datastack: "minnie65_public",
    server: "global.daf-apis.com",
    resolution: "4 × 4 × 40 nm",
    version: "v1507",
    synapses: "synapses_pni_2",
    ng: "https://spelunker.cave-explorer.org/#!middleauth+https://global.daf-apis.com/nglstate/api/v1/4658335189041152",
  },
  v1dd: {
    discipline: "connectomics",
    label: "V1DD",
    blurb: "V1 Deep-Dive: 800 × 800 µm of primary visual cortex spanning pia to white matter, imaged in 4 mice; EM in the same tissue.",
    datastack: "v1dd_public",
    server: "global.em.brain.allentech.org",
    resolution: "9 × 9 × 45 nm",
    version: "v1196",
    synapses: "synapses_v1dd",
    ng: "https://spelunker.cave-explorer.org/#!middleauth+https://global.em.brain.allentech.org/nglstate/api/v1/6116368998989824",
  },

  /* ── physiology ─────────────────────────────────────────────────
     Everything here is an NWB file. `asset` names the exact object whose
     structure the Tables view describes — read with
     `aws s3 cp --no-sign-request s3://aind-open-data/<asset>/.zmetadata -`,
     so anything shown there can be checked against the file itself.
     The AllenSDK project caches are deliberately not represented: they are
     being retired in favour of reading NWB directly.                     */
  v1dd_ophys: {
    discipline: "physiology",
    label: "V1 Deep Dive (2P)",
    blurb: "The two-photon side of V1DD: a ~1 mm³ volume of V1 imaged column by column in 4 mice. One mouse was then reconstructed in EM, which is what links this dataset to the connectomics side.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    asset: "409828_2018-11-06_14-02-59_filtered_2026-04-09_04-59-00",
    stats: [
      { v: "6", l: "imaging planes", sub: "one volume, 16 µm apart" },
      { n: 33214, l: "stimulus presentations", sub: "intervals/stimulus_table" },
      { v: "11", l: "epochs", sub: "intervals/epochs" },
    ],
  },
  bci: {
    discipline: "physiology",
    label: "Brain Computer Interface",
    blurb: "Layer 2/3 of motor cortex imaged while a mouse drives a lickport with the activity of one conditioned neuron, with single-cell photostimulation before and after to measure what learning changed.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    asset: "single-plane-ophys_731015_2025-01-10_18-06-31_processed_2025-08-03_20-39-09",
    stats: [
      { n: 1214, l: "segmented ROIs", sub: "one plane" },
      { v: "65", l: "BCI trials" },
      { n: 2567, l: "photostim trials" },
    ],
  },
  df: {
    discipline: "physiology",
    label: "Dynamic Foraging",
    blurb: "Behaviour-only sessions of a two-choice probabilistic reward task with non-stationary reward probabilities, spanning the training curriculum. The simplest NWB file here: no units, no imaging.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    asset: "behavior_761433_2025-03-27_08-51-54_processed_2025-03-28_05-00-28",
    stats: [
      { v: "1", l: "table", sub: "intervals/trials" },
      { v: "4", l: "acquisition series", sub: "licks and rewards" },
      { n: 400, l: "sessions released" },
    ],
  },
  npultra: {
    discipline: "physiology",
    label: "NP Ultra & Psychedelics",
    blurb: "Ultra-high-density Neuropixels spanning cortical depth, probing how psilocybin changes population activity. The 6 µm site pitch is what makes the fine waveform measures possible.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    asset: "ecephys_714527_2024-05-15_13-00-23_nwb_2025-08-03_21-11-22",
    stats: [
      { n: 719, l: "units", sub: "556 curated" },
      { n: 1536, l: "electrodes", sub: "4 probes" },
      { n: 6969, l: "visual presentations" },
    ],
  },
  dr: {
    discipline: "physiology",
    label: "Dynamic Routing",
    blurb: "Brain-wide Neuropixels recordings while mice perform a context-dependent go/no-go task: visual and auditory blocks alternate, and the same stimulus is a target or not depending on which block it is.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    asset: "ecephys_713655_2024-08-09_10-41-47_nwb_2026-05-18_21-59-59",
    stats: [
      { n: 3577, l: "units", sub: "5 probes" },
      { n: 1920, l: "electrodes" },
      { v: "515", l: "trials", sub: "in 6 blocks" },
    ],
  },
  ctlut: {
    discipline: "physiology",
    label: "Cell Type Look-Up Table",
    blurb: "Optotagged recordings built as ground truth for how identified cell types behave. Each unit carries the evidence for its own tagging call — latency, jitter and reliability per laser train.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    asset: "ecephys_655565_2023-03-31_14-47-36_nwb_2025-07-16_16-52-27",
    stats: [
      { v: "2", l: "probes", sub: "one emits the light" },
      { v: "opto", l: "response per unit", sub: "latency · jitter · reliability" },
    ],
  },
  microns_fn: {
    discipline: "physiology",
    label: "MICrONS (functional)",
    blurb: "The functional side of MICrONS: two-photon responses from the same cortical volume that was later cut for EM. Unlike everything else here it is not packaged as NWB — the coregistration and the digital-twin tuning live in CAVE tables, and the scans are distributed through MICrONS Explorer.",
    access: "CAVEclient",
    backend: "CAVE tables + external scans",
    ng: "https://spelunker.cave-explorer.org/#!middleauth+https://global.daf-apis.com/nglstate/api/v1/4658335189041152",
    stats: [
      { n: 19181, l: "manually coregistered" },
      { n: 83046, l: "automatically coregistered" },
      { v: "2", l: "digital-twin tables" },
    ],
  },
};

// Colour is used for exactly one thing in the glossary: which category a term
// belongs to. Nothing else on the page borrows these hues. See README.
window.CATEGORIES = [
  /* ── connectomics ─────────────────────────────────────────────── */
  { id: "datasets",       discipline: "connectomics", label: "Datasets & scope",            short: "DATASETS", color: "#0e7f8c" },
  { id: "imaging",        discipline: "connectomics", label: "Imaging & ultrastructure",    short: "IMAGING",  color: "#8a6f4a" },
  { id: "volume",         discipline: "connectomics", label: "Volume, voxels & coordinates",short: "VOLUME",   color: "#2f6fd0" },
  { id: "segmentation",   discipline: "connectomics", label: "Segmentation & reconstruction",short:"SEGMENT",  color: "#6d55e0" },
  { id: "morphology",     discipline: "connectomics", label: "Morphology — meshes & skeletons", short: "MORPH", color: "#2a8f57" },
  { id: "proofreading",   discipline: "connectomics", label: "Proofreading & data quality", short: "PROOF",    color: "#b8791a" },
  { id: "cave",           discipline: "connectomics", label: "CAVE — access & versioning",  short: "CAVE",     color: "#0f766e" },
  { id: "tables",         discipline: "connectomics", label: "Annotation tables, IDs & queries", short: "TABLES", color: "#9333ea" },
  { id: "connectivity",   discipline: "connectomics", label: "Connectivity & synapses",     short: "CONNECT",  color: "#d1462c" },

  // cell types are the same cells whichever way they were recorded, so this
  // category belongs to both. A single term can override with its own
  // `discipline` field when the category's default is wrong for it.
  { id: "celltypes",      discipline: "both",         label: "Cell types & cortical anatomy", short: "CELLTYPE", color: "#c9357f" },
  { id: "functional",     discipline: "connectomics", label: "Functional data & coregistration", short: "FUNCTION", color: "#9a5b12" },
  { id: "tools",          discipline: "connectomics", label: "Visualisation tools",         short: "TOOLS",    color: "#526278" },

  /* ── physiology ───────────────────────────────────────────────── */
  { id: "modalities",     discipline: "physiology",   label: "Recording modalities & instruments", short: "MODALITY", color: "#c2410c" },
  { id: "signals",        discipline: "physiology",   label: "Signals & preprocessing",     short: "SIGNAL",   color: "#0369a1" },
  { id: "quality",        discipline: "physiology",   label: "Quality metrics",             short: "QUALITY",  color: "#4338ca" },
  { id: "genetics",       discipline: "physiology",   label: "Genetic & optical tools",     short: "GENETIC",  color: "#15803d" },
  { id: "stimuli",        discipline: "physiology",   label: "Stimuli & behavioural tasks", short: "STIMULUS", color: "#a16207" },
  { id: "responses",      discipline: "physiology",   label: "Response properties & analysis", short: "RESPONSE", color: "#9f1239" },
  { id: "dataorg",        discipline: "physiology",   label: "Datasets, sessions & files",  short: "DATA",     color: "#3f3f46" },
];

// Colours inside the illustrations mean anatomy, never category. Four roles,
// deliberately a different visual family from the category hues above.
window.ANATOMY = [
  { id: "scaffold", label: "structure / volume" },
  { id: "dendrite", label: "dendrite" },
  { id: "axon",     label: "axon" },
  { id: "synapse",  label: "synapse" },
];
