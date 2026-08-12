# Audit: how to represent physiology "tables"

Companion to `AUDIT-physiology-and-ambiguity.md`. This one answers a narrower question:
the Tables view was designed around CAVE annotation tables. Physiology data is not shaped
like that. What should the Tables view show, and how.

Sources read: `practicalities/pyNWB.md`, the dataset and session-data pages for all eight
physiology datasets, and the 2026 course notebooks.

---

## 1. The core finding: "table" means two different things

Connectomics has **one** access pattern — named tables in a queryable database:

```python
client.materialize.query_table("nucleus_detection_v0")
```

Physiology has **two**, and they look nothing alike.

### Pattern A — SDK cache (the four Brain Observatory datasets)

Visual Coding 2P, Visual Coding Neuropixels, Visual Behavior Ophys, Visual Behavior
Neuropixels. A `Cache` object downloads and hands back **manifest tables** (pandas
DataFrames you filter to *find* data) and then **session objects** whose attributes are
the data itself.

```python
cache = VisualBehaviorOphysProjectCache.from_s3_cache(cache_dir=cache_dir)
cache.get_ophys_experiment_table()          # manifest: one row per imaging plane
exp = cache.get_behavior_ophys_experiment(ophys_experiment_id)
exp.dff_traces, exp.stimulus_presentations, exp.trials   # the data
```

### Pattern B — NWB file (everything newer)

V1DD, BCI, Dynamic Foraging, NP Ultra & Psychedelics, Cell Type Look-Up Table. No cache,
no manifest: you open a `.nwb.zarr` and read objects at known paths.

```python
from hdmf_zarr import NWBZarrIO
nwb = NWBZarrIO(session_path, "r").read()
nwb.units[:]                       # DataFrame, one row per sorted unit
nwb.intervals["trials"][:]         # DataFrame, one row per trial
nwb.processing["ophys"]            # dF/F, ROI masks
nwb.acquisition["right_lick_time"] # timeseries
```

**Design consequence.** A physiology node cannot carry a row count — the number of units
is per session, not per dataset. What it *can* carry, and what a reader actually needs, is
**the expression that gets you the object**. So the node's second line becomes an access
path rather than a row count. Everything else about the node — name, key columns,
one-line description — carries over unchanged.

---

## 2. Proposed lane structure

Seven lanes, mirroring the connectomics view so the two disciplines look like siblings:

| Lane | Holds | Analogue in connectomics |
|---|---|---|
| **Find** | Manifest and cache tables you filter to locate data | (none — CAVE has no manifest) |
| **Cells & units** | `units`, `cell_specimen_table`, ROI masks | Detection |
| **Quality** | Spike-sorting and segmentation quality columns | Proofreading |
| **Activity** | `spike_times`, `dff_traces`, `events`, LFP, waveforms | (the measurement itself) |
| **Stimulus** | `stimulus_presentations`, templates, epochs | (none) |
| **Behavior** | `trials`, licks, rewards, running, eye tracking | (none) |
| **Analysis** | What you assemble yourself — greyed, as in connectomics | Analysis |

Same 7-column lane grid, same node card, same greyed-and-dashed treatment for the
derived lane. A reader who has used the connectomics tab needs to learn nothing.

**Colour.** These need seven hues of their own, distinct from the seven connectomics
group hues. The two palettes never share a screen (the discipline filter selects one),
but they *do* meet on the printed sheet under "All". The sheet must therefore print each
discipline's table section under its own heading with its own legend directly above it —
not one merged legend. That keeps the one-palette-one-meaning rule intact.

---

## 3. Per-dataset inventory

Nine entries for the dataset filter. V1DD appears under both disciplines, which is a
feature — it is the dataset that joins them.

| Dataset | Access | Backend |
|---|---|---|
| Visual Coding 2P | `BrainObservatoryCache` | NWB / HDF5 |
| Visual Coding Neuropixels | `EcephysProjectCache` | NWB / HDF5 |
| Visual Behavior Ophys | `VisualBehaviorOphysProjectCache` | NWB / HDF5 |
| Visual Behavior Neuropixels | `VisualBehaviorNeuropixelsProjectCache` | NWB / HDF5 |
| V1 Deep Dive | `NWBZarrIO` | NWB / Zarr |
| Brain Computer Interface | `NWBZarrIO` | NWB / Zarr |
| Dynamic Foraging | `NWBZarrIO` | NWB / Zarr, behaviour only |
| NP Ultra & Psychedelics | `NWBZarrIO` | NWB / Zarr |
| Cell Type Look-Up Table | `NWBZarrIO` | NWB / Zarr |

Nine is too many for the three-button row the connectomics tab uses. Two options:

- a `<select>` when the discipline is Physiology, keeping the button row for Connectomics;
- **preferred:** a wrapping pill row, since the buttons are already small and a wrapped
  second line costs nothing. It also stays keyboard-navigable and prints sensibly.

Headline stats per dataset (the equivalent of the connectomics stat card) should be the
counts the databook actually states: sessions, units or cells, areas, mice. Where the
databook gives no number, the stat is omitted rather than guessed — same rule as now.

---

## 4. Recipes to add

Four physiology snippets, matching the four connectomics ones in length and register.
All are transcribed from the databook, not invented.

**Open a session** — the fork every reader hits first:

```python
# Brain Observatory datasets: a cache hands you manifest tables and session objects
from allensdk.brain_observatory.behavior.behavior_project_cache import (
    VisualBehaviorOphysProjectCache)

cache = VisualBehaviorOphysProjectCache.from_s3_cache(cache_dir=cache_dir)
experiments = cache.get_ophys_experiment_table()     # one row per imaging plane
exp = cache.get_behavior_ophys_experiment(experiments.index[0])

# Newer datasets: open the NWB file directly
from hdmf_zarr import NWBZarrIO

nwb = NWBZarrIO(session_path, "r").read()
nwb.units[:]                       # sorted units, one row each
nwb.intervals["trials"][:]         # task trials
```

**Filter units by quality** — the step most analyses get wrong:

```python
units = session.units          # or nwb.units[:]

good = units[(units.isi_violations < 0.5) &      # contamination
             (units.amplitude_cutoff < 0.1) &    # missing spikes
             (units.presence_ratio > 0.9)]       # present all session

# Visual Coding applies these by default; Visual Behavior Neuropixels does not.
# Loosen them if you do not need well-isolated units; tighten if you do.
```

**Align spikes to a stimulus** — the PSTH, in the fewest honest lines:

```python
import numpy as np

stim = session.stimulus_presentations
onsets = stim[stim.stimulus_name == "natural_scenes"].start_time.values

bins = np.arange(-0.2, 0.5, 0.01)                     # s, relative to onset
spikes = session.spike_times[unit_id]
counts = np.stack([np.histogram(spikes - t, bins)[0] for t in onsets])

psth = counts.mean(0) / np.diff(bins)                 # spikes / s
```

**Get a unit's brain area** — the join people miss, and the answer to §6 below:

```python
# a unit carries no position of its own; it inherits it from its peak channel
units = session.units
channels = session.channels

located = units.merge(channels, left_on="peak_channel_id", right_index=True)
located[["firing_rate", "structure_acronym",
         "anterior_posterior_ccf_coordinate"]].head()
```

A fifth, for the ophys side, if there is room:

```python
dff = exp.dff_traces                       # one row per cell, 'dff' is the trace
events = exp.events                        # deconvolved, same timestamps
t = exp.ophys_timestamps                   # seconds, len == len(dff.iloc[0].dff)

stim = exp.stimulus_presentations
changes = stim[stim.is_change].start_time  # image changes
omitted = stim[stim.omitted].start_time    # the 5% dropped presentations
```

---

## 5. Unit quality metrics — question 7

**The databook does already cover this**, thoroughly: `physiology/ephys/visual-coding/
vcnp-quality-metrics.md` is a full tutorial deriving each metric, with a section per
metric and guidance on how each one can be biased. `vcnp-units.md` additionally carries
the complete column table.

So: **do not duplicate the tutorial.** The right split is

- **Glossary** — one short entry per metric, so someone reading a colleague's filter code
  can look up `amplitude_cutoff` in ten seconds. Each carries a `source` link to the
  databook page. That is what the `source` field added last week is for.
- **Tables** — one node, `units`, in the Cells & units lane, whose key-columns line lists
  the metrics; plus one node in the Quality lane that names the three default filters and
  their thresholds. This is the piece the databook does *not* make scannable.

The one thing worth stating loudly, in both places, because it silently changes results:
**Visual Coding applies default quality filters; Visual Behavior Neuropixels returns all
units unfiltered.** Same SDK, opposite defaults.

---

## 6. "Peak channel" — question 9

**Keep it.** It is not incidental vocabulary. It appears in eight databook pages, and its
dominant use is as a join key:

```python
units.merge(channels, left_on="peak_channel_id", right_index=True)
```

A unit has no location of its own. Its CCF coordinates, its `structure_acronym`, its
cortical depth and its probe position all come from the channel where its waveform was
largest. So "peak channel" is the concept that connects a spike to a place in the brain —
which is exactly the sort of thing a glossary exists for.

The instinct behind the objection is still right, though: it should be defined as **the
join**, not as a column in a listing. Proposed definition:

> **Peak channel** — the probe channel on which a unit's mean waveform is largest. A unit
> carries no position of its own; joining `peak_channel_id` to the channels table is how
> it acquires a CCF location, a brain-region label and a depth. Also the channel the
> waveform-shape metrics are computed on.

The same test applied to the rest of §1.3 of the other audit demotes a few entries from
glossary terms to key-columns-on-a-node: `num_positive_peaks`, `sync_spike_2/4/8`,
`peak_waveform_index`, `electrode_group_name`. They are real columns, but no one needs a
*name* for them. They stay in the Tables view and out of the glossary.

---

## 7. Summary of what this implies for the build

1. A node gains an `access` field (an expression) which renders where `rows` renders now;
   `rows` stays for connectomics.
2. `TABLES` becomes keyed by discipline, then dataset. Connectomics data is untouched.
3. `TABLE_GROUPS` becomes per-discipline: the existing seven for connectomics, seven new
   ones with their own hues for physiology.
4. The dataset pill row wraps and is populated from the active discipline.
5. The printed sheet emits one table section per selected discipline, each under its own
   heading and its own legend.
