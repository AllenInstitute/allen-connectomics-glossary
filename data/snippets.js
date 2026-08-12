// snippets.js — short recipes shown on the Tables page and on the printed sheet.
//
// Each snippet carries one block per language. Only the languages present here
// get a tab, so adding an "r" key to a snippet is all it takes to light up an
// R tab for it — nothing in the site needs changing.

window.LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "r",      label: "R" },
];

// `disc` scopes a snippet to one discipline; omit it and it shows in both.
window.SNIPPETS = [
  {
    id: "setup",
    disc: "connectomics",
    title: "Connect to a datastack",
    python: `from caveclient import CAVEclient

# MICrONS
client = CAVEclient("minnie65_public")

# V1DD — different server, so authenticate against it separately
client = CAVEclient("v1dd_public",
                    server_address="https://global.em.brain.allentech.org")

client.materialize.version          # the snapshot you are querying`,
  },
  {
    id: "connectivity",
    disc: "connectomics",
    title: "Synapses of one neuron, collapsed to connections",
    python: `# outputs of a cell (use post_ids= for its inputs)
syn = client.materialize.synapse_query(pre_ids=my_root_id)

# one row per pre -> post pair, with a synapse count
(syn.groupby(["pre_pt_root_id", "post_pt_root_id"])
    .count()[["id"]]
    .rename(columns={"id": "syn_count"})
    .sort_values("syn_count", ascending=False))

# then keep only proofread axons and join a cell-type table on pt_root_id`,
  },
  {
    id: "query",
    disc: "connectomics",
    title: "Query a table",
    python: `client.materialize.query_table(
    "nucleus_detection_v0",
    filter_in_dict={"id": my_nucleus_ids},
    desired_resolution=[1000, 1000, 1000],   # nm per unit -> microns
    select_columns=["id", "pt_position", "pt_root_id"],
    split_positions=True,
)
# returns at most 200,000 rows — filter, do not paginate blindly`,
  },
  {
    id: "proofread",
    disc: "connectomics",
    title: "Restrict to proofread arbors",
    python: `pr = client.materialize.query_table("proofreading_status_and_strategy")

clean_axons = pr[pr.status_axon]        # merges removed; may be incomplete
complete    = pr[pr.strategy_axon.isin(["axon_fully_extended",
                                        "axon_interareal"])]

# valid_id is the root id at the time of assessment — if it differs from the
# current pt_root_id, the cell has been edited since.`,
  },

  /* ── physiology ─────────────────────────────────────────────── */
  {
    id: "open",
    disc: "physiology",
    title: "Open a session",
    python: `# Brain Observatory datasets: a cache hands you manifest tables,
# then session objects
from allensdk.brain_observatory.behavior.behavior_project_cache import (
    VisualBehaviorOphysProjectCache)

cache = VisualBehaviorOphysProjectCache.from_s3_cache(cache_dir=cache_dir)
experiments = cache.get_ophys_experiment_table()   # one row per imaging plane
exp = cache.get_behavior_ophys_experiment(experiments.index[0])

# Newer datasets: no cache, no manifest — open the NWB file directly
from hdmf_zarr import NWBZarrIO

nwb = NWBZarrIO(session_path, "r").read()
nwb.units[:]                       # sorted units, one row each
nwb.intervals["trials"][:]         # task trials`,
  },
  {
    id: "quality",
    disc: "physiology",
    title: "Filter units by quality",
    python: `units = session.units            # or nwb.units[:]

good = units[(units.isi_violations < 0.5) &     # contamination
             (units.amplitude_cutoff < 0.1) &   # spikes missed
             (units.presence_ratio > 0.9)]      # present all session

# Visual Coding applies these by default. Visual Behavior Neuropixels does
# not — it returns every unit. Loosen them if you do not need well-isolated
# units, tighten them if you do.`,
  },
  {
    id: "psth",
    disc: "physiology",
    title: "Align spikes to a stimulus",
    python: `import numpy as np

stim = session.stimulus_presentations
onsets = stim[stim.stimulus_name == "natural_scenes"].start_time.values

bins = np.arange(-0.2, 0.5, 0.01)              # s, relative to onset
spikes = session.spike_times[unit_id]
counts = np.stack([np.histogram(spikes - t, bins)[0] for t in onsets])

psth = counts.mean(0) / np.diff(bins)          # spikes / s`,
  },
  {
    id: "locate",
    disc: "physiology",
    title: "Give a unit a brain area",
    python: `# a unit carries no position of its own: it inherits one from the
# channel where its waveform was largest
located = session.units.merge(session.channels,
                              left_on="peak_channel_id", right_index=True)

located[["firing_rate", "ecephys_structure_acronym",
         "anterior_posterior_ccf_coordinate"]].head()`,
  },
];
