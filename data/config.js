// config.js — datasets, categories, and the colour rules for the whole site.
// Plain data. Edit values freely; leave the "window.X =" wrappers alone so the
// files keep working when index.html is opened straight off disk (file://).

window.SITE = {
  title: "Allen Connectomics Glossary",
  // shown in the footer; bump when you make a change worth flagging to readers
  revision: "2026-07",
  databook: "https://allenswdb.github.io/anatomy/microns-em/em-background.html",
  // the Community tab opens this in a new tab; clear it to drop the tab
  community: "https://community.brain-map.org/",
};

window.DATASETS = {
  microns: {
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
    label: "V1DD",
    blurb: "V1 Deep-Dive: 800 × 800 µm of primary visual cortex spanning pia to white matter, imaged in 4 mice; EM in the same tissue.",
    datastack: "v1dd_public",
    server: "global.em.brain.allentech.org",
    resolution: "9 × 9 × 45 nm",
    version: "v1196",
    synapses: "synapses_v1dd",
    ng: "https://spelunker.cave-explorer.org/#!middleauth+https://global.em.brain.allentech.org/nglstate/api/v1/6116368998989824",
  },
};

// Colour is used for exactly one thing in the glossary: which category a term
// belongs to. Nothing else on the page borrows these hues. See README.
window.CATEGORIES = [
  { id: "datasets",       label: "Datasets & scope",            short: "DATASETS", color: "#0e7f8c" },
  { id: "imaging",        label: "Imaging & ultrastructure",    short: "IMAGING",  color: "#8a6f4a" },
  { id: "volume",         label: "Volume, voxels & coordinates",short: "VOLUME",   color: "#2f6fd0" },
  { id: "segmentation",   label: "Segmentation & reconstruction",short:"SEGMENT",  color: "#6d55e0" },
  { id: "morphology",     label: "Morphology — meshes & skeletons", short: "MORPH", color: "#2a8f57" },
  { id: "proofreading",   label: "Proofreading & data quality", short: "PROOF",    color: "#b8791a" },
  { id: "cave",           label: "CAVE — access & versioning",  short: "CAVE",     color: "#0f766e" },
  { id: "tables",         label: "Annotation tables, IDs & queries", short: "TABLES", color: "#9333ea" },
  { id: "celltypes",      label: "Cell types & cortical anatomy", short: "CELLTYPE", color: "#c9357f" },
  { id: "connectivity",   label: "Connectivity & synapses",     short: "CONNECT",  color: "#d1462c" },
  { id: "functional",     label: "Functional data & coregistration", short: "FUNCTION", color: "#9a5b12" },
  { id: "tools",          label: "Visualisation tools",         short: "TOOLS",    color: "#526278" },
];

// Colours inside the illustrations mean anatomy, never category. Four roles,
// deliberately a different visual family from the category hues above.
window.ANATOMY = [
  { id: "scaffold", label: "structure / volume" },
  { id: "dendrite", label: "dendrite" },
  { id: "axon",     label: "axon" },
  { id: "synapse",  label: "synapse" },
];
