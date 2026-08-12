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
    { label: "AllenSDK documentation",   url: "https://allensdk.readthedocs.io/" },
  ],
  // the Community tab opens this in a new tab; clear it to drop the tab
  community: "https://community.brain-map.org/",
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

  /* ── physiology ───────────────────────────────────────────────────
     `access` names the entry point; `backend` the file format. Together
     they are what a reader needs before opening anything.               */
  vc2p: {
    discipline: "physiology",
    label: "Visual Coding 2P",
    blurb: "Survey of activity in awake mouse visual cortex: six cortical areas, 14 transgenic lines, across layers, viewing passive visual stimuli.",
    access: "BrainObservatoryCache",
    backend: "NWB / HDF5",
    stats: [
      { v: "6", l: "visual areas" },
      { v: "14", l: "transgenic lines" },
      { v: "3", l: "sessions per container" },
    ],
  },
  vcnp: {
    discipline: "physiology",
    label: "Visual Coding Neuropixels",
    blurb: "Six Neuropixels probes recording spikes across cortex and thalamus during passive visual stimulation.",
    access: "EcephysProjectCache",
    backend: "NWB / HDF5",
    stats: [
      { v: "6", l: "probes per session" },
      { v: "384", l: "channels per probe" },
    ],
  },
  vbo: {
    discipline: "physiology",
    label: "Visual Behavior Ophys",
    blurb: "Two-photon imaging of the same neurons across days while mice perform a visual change-detection task, with familiar and novel images.",
    access: "VisualBehaviorOphysProjectCache",
    backend: "NWB / HDF5",
    stats: [
      { n: 50482, l: "neurons" },
      { n: 704, l: "imaging sessions" },
      { v: "8", l: "planes per session", sub: "Multiscope" },
    ],
  },
  vbn: {
    discipline: "physiology",
    label: "Visual Behavior Neuropixels",
    blurb: "Up to six Neuropixels probes in cortex, hippocampus, thalamus and midbrain during the same change-detection task, with a passive replay block.",
    access: "VisualBehaviorNeuropixelsProjectCache",
    backend: "NWB / HDF5",
    stats: [
      { n: 200000, l: "units" },
      { n: 153, l: "sessions" },
      { v: "2", l: "image sets", sub: "G and H" },
    ],
  },
  v1dd_ophys: {
    discipline: "physiology",
    label: "V1 Deep Dive (2P)",
    blurb: "The two-photon side of V1DD: a ~1 mm³ volume of V1 imaged column by column, in 4 mice. One mouse was then reconstructed in EM.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    stats: [
      { v: "4", l: "mice", sub: "one also imaged in EM" },
      { v: "5 × 5", l: "columns × volumes" },
      { v: "6", l: "planes per volume", sub: "16 µm apart" },
    ],
  },
  bci: {
    discipline: "physiology",
    label: "Brain Computer Interface",
    blurb: "Layer 2/3 motor cortex imaged while a mouse drives a lickport with the activity of one conditioned neuron, with 2P photostimulation before and after.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    stats: [
      { v: "1", l: "conditioned neuron" },
      { n: 500, l: "neurons per plane" },
      { v: "10", l: "seconds per trial" },
    ],
  },
  df: {
    discipline: "physiology",
    label: "Dynamic Foraging",
    blurb: "Behaviour-only sessions of a two-choice probabilistic reward task with non-stationary reward probabilities, across training stages.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    stats: [
      { n: 400, l: "sessions", sub: "behaviour only" },
      { v: "2", l: "choices" },
    ],
  },
  npultra: {
    discipline: "physiology",
    label: "NP Ultra & Psychedelics",
    blurb: "Ultra-high-density Neuropixels across cortical depth, probing how psilocybin changes population activity.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    stats: [
      { v: "6", l: "µm site pitch" },
      { v: "192 × 2", l: "channel configuration" },
    ],
  },
  ctlut: {
    discipline: "physiology",
    label: "Cell Type Look-Up Table",
    blurb: "Optotagged recordings in mouse striatum, built as ground truth for the responses of identified cell types.",
    access: "NWBZarrIO",
    backend: "NWB / Zarr",
    stats: [
      { v: "opto", l: "tagged units" },
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
