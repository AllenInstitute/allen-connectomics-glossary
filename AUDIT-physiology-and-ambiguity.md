# Audit: physiology coverage and cross-discipline ambiguity

Scope of this audit — what was read:

- `allenswdb.github.io/databook/` — `glossary.md` (54 headwords), all of `background/`,
  the conceptual pages of `physiology/` (ophys, ephys, stimuli), `computational/data-analysis/`
- `Projects/SWDB/` — `SWDB_2026_Behavioral_States`, `SWDB_2026_Connectomics`,
  `SWDB_2025_Connectomics`, `SWDB_Data_Intro` (notebook prose, not code)

Nothing in the glossary has been changed. This file is a proposal only, and is
untracked — it is not part of the site.

Current state: the glossary holds **120 terms, all connectomics**. The databook's own
`glossary.md` holds **54 terms, mostly physiology**, and the overlap between them is
**12 terms** — of which **5 disagree** (see §3).

---

## 1. Physiology terms that would complete the coverage

Roughly 95 candidates, grouped by the category they would need. The existing 12
categories are connectomics-shaped and do not fit most of these; §4 proposes the
new ones.

**Priority key** — **A** = a reader cannot follow the databook without it;
**B** = needed once they open the data; **C** = worth having, not load-bearing.

### 1.1 Recording modalities and instruments *(new category)*

| Term | Sense | Source | Pri |
|---|---|---|---|
| Extracellular electrophysiology (ephys) | Recording voltage outside the membrane; yields spikes + LFP | `background/Neuropixels-electrophysiology` | A |
| Optical physiology (ophys) | Measuring activity via a fluorescent indicator | `glossary.md`, `ophys-overview` | A |
| Two-photon microscopy | Non-linear excitation confining fluorescence to one voxel | `background/Two-photon-calcium-imaging` | A |
| Three-photon (3P) imaging | Deeper imaging with better SNR in dense lines; used for V1DD's deep column | `V1DD-overview` | B |
| Neuropixels 1.0 / 2.0 | 960 vs 1280 sites, 384 channels, ~20 vs ~15 µm site pitch | `neuropixels-description` | A |
| Neuropixels Opto | NP 1.0 plus 28 on-shank light emission sites | `neuropixels-description` | C |
| Neuropixels Ultra | 6 µm site pitch; fine waveform detail, shorter span | `neuropixels-description` | B |
| Spike band / LFP band | 30 kHz high-pass vs 2.5 kHz low-pass stream off the same channel | `neuropixels-description` | A |
| Probe / shank / channel / recording site | The physical recording hierarchy | `neuropixels-description` | A |
| Probe letter (A–F) | Rig slot naming, arranged clockwise around visual cortex | `vcnp-lfp` | C |
| Mesoscope / Multiscope | Multi-plane 2P microscope; up to 8 planes per session | `VBO-Dataset` | B |
| DeepScope | The V1DD microscope; 37 fps, 6 planes → 6 Hz per plane | `V1DD-overview` | C |
| Intrinsic signal imaging (ISI) | Blood-flow reflectance imaging used to map retinotopy | `glossary.md` | B |
| Head bar / head fixation | Surgically implanted bar; <10 µm repositioning across days | `experimental-setup` | A |
| Running disc | The wheel the head-fixed mouse runs on | `experimental-setup` | B |
| Imaging plane | One 2P focal plane; the unit an ophys experiment is defined on | `VBO-Dataset` | A |
| Field of view | The imaged extent, in pixels and µm | `VBO-ExperimentData` | B |
| Imaging depth | µm below the pial surface; loosely maps to layer | `vc2p-dataset` | A |
| Excitation / emission wavelength | 920 nm GCaMP, ~1080 nm ChRmine; sets the dual light path | `BCI-overview` | C |

### 1.2 Signals and preprocessing *(new category)*

| Term | Sense | Source | Pri |
|---|---|---|---|
| Spike sorting | Assigning detected spikes to putative neurons; blind source separation | `Neuropixels-electrophysiology` | A |
| Kilosort / Kilosort2 | The template-matching sorter used for all Allen Neuropixels data | `vcnp-quality-metrics` | A |
| Single unit vs multi-unit | A gradient, not two categories | `vcnp-quality-metrics` | A |
| Mean waveform | Per-unit average spike shape; basis of most waveform metrics | `neuropixels-description` | A |
| Peak channel | Channel carrying the largest waveform for a unit | `vcnp-units` | B |
| Whitening / median subtraction | Common-mode noise removal before sorting | `neuropixels-description` | C |
| Local field potential (LFP) | Low-frequency summed synaptic activity | `glossary.md`, `vcnp-lfp` | A |
| Current source density (CSD) | Second spatial derivative of LFP; localises sinks and sources | `vcnp-lfp` | B |
| Re-referencing | Subtracting out-of-brain channels from the LFP | `neuropixels-description` | C |
| ROI mask | Pixel mask for one segmented cell | `glossary.md`, `vc2p-session-data` | A |
| Neuropil / neuropil correction | Annulus signal subtracted with a per-cell `r` weight | `vc2p-session-data` | A |
| Demixing | Separating overlapping ROI signals | `vc2p-session-data` | B |
| ΔF/F (dF/F) | Fluorescence change over a rolling baseline (180 s median) | `vc2p-session-data` | A |
| Event detection (L0) | Deconvolving ΔF/F into discrete events; 1–2 AP events are unreliable | `Two-photon-calcium-imaging` | A |
| Motion correction | Registering the imaging movie before segmentation | `vc2p-session-data` | B |
| Maximum / average projection | Time-collapsed image of the whole field | `vc2p-session-data` | B |
| Suite2p / Cellpose | Segmentation algorithms used for BCI ROI extraction | `BCI-dataset` | C |
| Soma / dendrite classifier | Per-ROI call (`is_soma`, `soma_probability`) | `BCI-dataset` | B |
| Running speed | Wheel speed, temporally aligned to the activity traces | `vc2p-session-data` | A |
| Pupil diameter / eye tracking | Recorded only during 2P or Neuropixels sessions, not training | `VB-Behavior` | B |

### 1.3 Unit quality metrics *(new category — the single most under-documented block)*

Every metric below appears as a column name; readers filter on them daily.

| Term | Sense | Pri |
|---|---|---|
| `firing_rate` | Mean spike rate over the session | A |
| `presence_ratio` | Fraction of the session with spikes present (default ≥ 0.9) | A |
| `amplitude_cutoff` | Estimated fraction of spikes lost below detection threshold (default ≤ 0.1) | A |
| `isi_violations` / `isi_violations_ratio` | Refractory-period violation rate; contamination proxy (default ≤ 0.5) | A |
| `snr` | Waveform amplitude over background noise on the peak channel | A |
| `isolation_distance` | Mahalanobis separation from neighbouring clusters (higher better) | B |
| `d_prime` | LDA separability from neighbours (higher better) | B |
| `l_ratio` | Cluster contamination (lower better) | B |
| `nn_hit_rate` / `nn_miss_rate` | Nearest-neighbour contamination / missed-spike measures | B |
| `silhouette_score` | Cluster separation | C |
| `max_drift` / `cumulative_drift` | Electrode drift in µm across the session | B |
| `rp_contamination` / `sliding_rp_violation` | Newer refractory-period measures (Dynamic Routing units table) | B |
| `activity_drift`, `firing_range`, `amplitude_cv_*` | Session-stability measures in the AIND pipeline | C |
| `default_qc` | Pipeline pass/fail flag | B |
| `decoder_label` / `decoder_probability` | Pipeline cell-type call (`sua` = single unit) and its confidence | B |
| Waveform features | `waveform_duration`, `PT_ratio`, `spread`, `repolarization_slope`, `velocity_above/below`, `half_width`, `peak_to_valley` | B |

> Worth stating once, prominently: **Visual Coding applies default quality filters;
> Visual Behavior Neuropixels returns all units unfiltered.** Same SDK, opposite defaults.

### 1.4 Genetic and optical tools *(new category)*

Cre line, reporter line, driver line, transgenic line, GECI, GCaMP (6f vs 6s kinetics),
GFP, fluorophore, opsin, ChR2, ChRmine, enhancer AAV, Cre-dependent virus, optogenetics,
optotagging, tagged unit, laser pulse train, direct vs indirect activation, response
latency (<10 ms as the directness criterion), 2P photostimulation, conditioned neuron.

Most of these already exist in `databook/glossary.md` and could be adopted nearly verbatim
rather than rewritten. **Pri A** for Cre/reporter/driver/GCaMP/optotagging; **B** for the rest.

### 1.5 Stimuli, tasks and trial structure *(new category)*

| Term | Sense | Pri |
|---|---|---|
| Drifting gratings / static gratings | Full-field sinusoids; orientation, direction, SF, TF, contrast, phase | A |
| Drifting gratings, windowed | 30° aperture placed on the population receptive field (V1DD) | B |
| Gabor patches | Spatially restricted gratings; the RF-mapping stimulus (20°, 9×9 grid) | A |
| Locally sparse noise | Sparse black/white spots with a 5-pixel exclusion zone | A |
| Natural scenes / natural movies | 118 images; the *Touch of Evil* opening shot | A |
| Full-field flashes | Alternating black/white, 0.25 s, ~80% contrast | B |
| Dot motion | Direction, speed and coherence | B |
| Spontaneous activity | Mean-luminance grey epoch used as a baseline | A |
| Blank sweep | Grey trial interleaved among stimulus trials | A |
| Stimulus template | The literal image shown, stored alongside the stimulus table | B |
| Change detection task | go/no-go; report an image identity change for water | A |
| Trial outcomes | hit, miss, false alarm, correct reject, aborted | A |
| Catch trial / sham change | Change time drawn but identity unchanged | A |
| Omission | 5% of non-change presentations dropped during recording only | A |
| Image set (G / H, A / B) | Which eight images; determines familiarity | A |
| Experience level | `Familiar` vs `Novel` relative to the training set | A |
| Response window / grace period | 750 ms to respond; 3 s consumption window | B |
| d-prime (behavioural) | Signal-detection sensitivity for task performance | A |
| Passive replay block | Same stimuli, no reward, after the active block | B |
| Dynamic foraging | Two-choice probabilistic reward task with non-stationary probabilities | A |
| Baiting / coupled vs uncoupled | Whether unclaimed reward persists; whether sides change together | B |
| Q-value / RPE / choice kernel | Reinforcement-learning latents fitted to foraging behaviour | B |
| Dynamic Routing task | Context-dependent go/no-go alternating visual and auditory blocks | A |
| Context block / instruction trial | 10-minute rewarded-modality block and its signalling trials | A |
| Response modulation index (RMI) | Contrast of visual vs auditory response rates | B |
| Quiescent period | Pre-stimulus interval used to read internal state | B |
| BCI task / conditioned neuron (CN) | Lickport driven by one neuron's fluorescence | A |
| Threshold crossing | Lickport reaching the rewarded position | B |

### 1.6 Response properties and analysis *(new category)*

Receptive field, retinotopy (altitude / azimuth), higher visual area, tuning curve,
preferred orientation / direction, orientation and direction selectivity index,
lifetime sparseness, reliability, evoked vs spontaneous response, response latency,
PSTH, spike raster, spike counts / binning, signal correlation, noise correlation,
sweep response / mean sweep response, encoding vs decoding, linear classifier,
confusion matrix, cross-validation, z-scoring, PCA, GLM, logistic regression,
HMM / latent state, null model, distance-matched surrogate, surround suppression.

**Pri A**: receptive field, retinotopy, HVA, PSTH, raster, signal/noise correlation,
encoding/decoding, evoked vs spontaneous. The rest **B/C**.

Note: OSI, DSI, gOSI, gDSI, `pref_ori`, `pref_dir`, oracle score, `cc_abs/max/norm`,
`readout_loc_x/y` and digital twin **already exist** in the glossary, defined from the
MICrONS functional tables. Their databook senses are the same concept measured a
different way — merge, do not duplicate.

### 1.7 Data organisation and access *(new category)*

| Term | Sense | Pri |
|---|---|---|
| NWB | Standard file format for physiology and behaviour | A |
| HDF5 vs Zarr backend | Visual Coding/Behavior use HDF5; V1DD, BCI, DF, NP Ultra use Zarr | A |
| Cache / manifest | `BrainObservatoryCache`, `VisualBehaviorOphysProjectCache`, etc. | A |
| AllenSDK | The Python client for the physiology datasets | A |
| Behavior session | One behavioural recording, with or without physiology | A |
| Ophys session | One continuous recording under the microscope | A |
| Ophys experiment | **One imaging plane within one ophys session** | A |
| Ophys container / experiment container | The same imaging plane across days | A |
| Ecephys session | One Neuropixels recording session | A |
| Session type | The stimulus/training protocol label (`OPHYS_4`, `TRAINING_5_…`) | A |
| Retake | A re-run of a `session_type` after QC failure | B |
| `cell_specimen_id` vs `cell_roi_id` | Matched across sessions vs unique to one session | A |
| `unit_id`, `cluster_id`, `local_index` | Dataset-wide vs sorter-assigned vs within-probe ids | A |
| Stimulus table / stimulus presentations | One row per trial, with parameters and times | A |
| Stimulus epoch table | Start/end of each interleaved stimulus block | A |
| Trials table / intervals | Task trial structure in NWB | A |
| Units / probes / channels tables | The ephys metadata triad | A |
| CCF (Common Coordinate Framework) | Standard 3D mouse-brain reference space | A |
| Structure acronym | CCF region label attached to a unit or channel | A |
| AIND metadata schema | `data_description`, `subject`, `procedures`, `rig`/`instrument`, `session`/`acquisition`, `processing` | B |
| Common Connectivity store / `DatasetReader` | The V1DD release format used in the 2026 workshops: datasets = cohorts, feature sets, cluster sets | B |
| `proofread_dendrites` vs `proofread_axons` | The two cohorts; only the latter licenses "no synapse found = no synapse" | A |

### 1.8 Cross-modality caveats — small but high value

Ephys selection bias (large-spike, high-rate neurons over-represented; layer 5 over-sampled);
calcium indicators sparsify spiking (bursts non-linearly boosted, single spikes lost);
PV cells buffer calcium, so event-rate estimates for them are unreliable. These are
conceptual warnings, not vocabulary, but they are exactly what a glossary reader needs
before comparing the two modalities. **Pri A.**

---

## 2. Overloaded, ambiguous, and weak-semantics terms

Ranked by how much damage the collision does. Each row lists the distinct senses and
where each one lives. The databook already flags three of these itself ("*There is no
consistent use of this term*") — that language is worth adopting.

### Tier 1 — actively causes wrong analyses

| Term | Senses in play |
|---|---|
| **Session** | (1) one continuous recording, databook's definition; (2) `behavior_session` — may have no physiology; (3) `ophys_session` — may hold 1–8 imaging planes; (4) `ecephys_session`; (5) MICrONS `session` index, part of the ROI's functional id, **already defined that way in this glossary**. A reader moving between the two glossaries gets contradictory definitions of the same word. |
| **Experiment** | Databook: *no consistent use*. In VBO it is **one imaging plane in one session** — the narrowest thing in the hierarchy. In Visual Coding it is closer to a session. Colloquially it is the whole campaign. Most dangerous term in the corpus. |
| **Container** | Databook: *no consistent use*. `experiment_container` (VC2P) vs `ophys_container` (VBO) vs the NWB `processing` **container** vs the Code Ocean/Docker **container** the code runs in. |
| **Unit** | (1) a putative neuron from spike sorting; (2) the MICrONS/V1DD ROI `unit_id` — a two-photon cell, **already the glossary's definition**; (3) unit of measurement. (1) and (2) are different recording modalities wearing the same word. |
| **Dataset** | Databook: *no consistent use*. Also: a CAVE **datastack**; a Common Connectivity **dataset** = a proofreading cohort; an NWB dataset = an HDF5 array. |
| **Cell id** | `cell_specimen_id` (matched across sessions) vs `cell_roi_id` (one session) vs EM nucleus `cell_id`/`soma_id` vs `closest_roi` index. Silent joins on the wrong one are easy. |
| **Distance** | Euclidean, radial, streamline-radial, geodesic (= path length) — all four are used in one connectomics module — plus `isolation_distance` and Mahalanobis distance in quality metrics. |

### Tier 2 — the same word across two disciplines

| Term | Senses in play |
|---|---|
| **Epoch** | Stimulus epoch (databook, and an NWB table) vs training epoch (ML) vs "experimental epochs" vs an epoch of spontaneous activity. Weak everywhere; means only "a labelled stretch of time". |
| **State** | Behavioural state; brain state; HMM latent state; **Neuroglancer state** (a JSON view spec, already in this glossary). |
| **Layer** | Cortical layer; Neuroglancer layer (already flagged here); network layer in a DNN/digital twin. |
| **Column** | MICrONS census column; V1DD scan column (both already flagged); cortical column (anatomy); DataFrame column. Four senses, two flagged. |
| **Frame** | Imaging frame; stimulus frame; behaviour-video frame; coordinate frame. `start_frame` vs `start_time` appear side by side in several tables. |
| **Segmentation** | EM dense segmentation; ROI extraction (the BCI `image_segmentation` table); behavioural segmentation into states. |
| **Projection** | Maximum/average projection (an image); projection class (IT/ET/CT/NP); axonal projection; PCA projection. |
| **Structure** | Targeted structure (a brain region); ultrastructure; structure–function; data structure. |
| **Target** | Postsynaptic target; stimulus target (VIS+/AUD+); targeted structure; `target_id` reference column. Already flagged here for the last two senses only. |
| **Index** | Selectivity index (OSI/DSI/RMI); DataFrame index; cell index into a trace; `scan_idx`; `local_index`. "Index" alone carries no meaning. |
| **Channel** | Probe recording channel; imaging channel (wavelength); ion channel (opsin, VGCC). All three appear within two paragraphs of each other in the optogenetics pages. |
| **Cluster** | Spike-sorting cluster; cell-type cluster (mtype); k-means cluster; `ClusterHierarchy` in the Common Connectivity store. |
| **Feature** | Waveform feature; stimulus feature; behavioural feature; ML feature; `CellFeatureMatrix`. |
| **Drift** | Electrode drift; `activity_drift`; behavioural drift. |
| **Event** | Extracted calcium event; task event; NWB event. |
| **Trace** | ΔF/F trace; voltage trace; LFP trace; skeleton path. |
| **Response** | Evoked neural response; behavioural response (a lick); response rate; response window. |
| **Signal** | Signal correlation; signal-to-noise; LFP signal; intrinsic signal. |
| **Depth** | Cortical depth; imaging depth; probe insertion depth; spike depth (in drift metrics); tree depth. |
| **Resolution** | Spatial/temporal resolution; voxel resolution; `desired_resolution` (a query argument in µm). |
| **Plane** | Imaging plane; V1DD volume plane; sectioning plane. |
| **Block** | Trial block (context block, passive replay); the 32-channel whitening block; code block. |
| **Threshold** | Spike detection threshold; QC threshold; BCI lickport position threshold; behavioural response threshold. |
| **Hit** | Behavioural hit; `nn_hit_rate`; hit rate as a performance measure. |
| **Model** | Digital twin; GLM; HMM; RL model; null model. |
| **Rate** | Firing rate; response rate; reward rate; learning rate; frame rate. |

### Tier 3 — acronym collisions

| Acronym | Senses |
|---|---|
| **ISI** | Interspike interval **and** intrinsic signal imaging — both defined in `databook/glossary.md`, adjacent entries. Also inter-stimulus interval, used unexpanded in `VB-Behavior`. |
| **RS** | Regular spiking **and** (elsewhere in neuroscience) resting state. |
| **CN** | Conditioned neuron (BCI) — collides with common use for cranial nerve / cerebellar nuclei. |
| **DR** | Dynamic Routing (course) — collides with dorsal raphe. |
| **ROI** | Region of interest as an image mask **and** as a functionally imaged cell. |
| **SNR** | Signal-to-noise ratio — computed three different ways (waveform SNR, trace SNR, response SNR) in three different places. |

### Tier 4 — weak semantic content, used as if precise

`activity`, `quality`, `performance`, `engagement`, `raw`, `processed`, `derived`,
`type`, `class` / `classification` (`classification_system` column vs ML classification),
`good` (as in "good units"), `valid`, `metric`, `pipeline`, `analysis file`.

Each of these appears in a place where it looks like a defined quantity but is not.
"Good units" is the sharpest example: it names a filter whose thresholds differ between
Visual Coding, Visual Behavior, and the Dynamic Routing notebooks.

---

## 3. Conflicts between this glossary and `databook/glossary.md`

12 headwords overlap. Five disagree and need a decision before physiology terms land:

| Term | This glossary | Databook glossary |
|---|---|---|
| **Session** | The MICrONS imaging `session` index, part of an ROI's unique id | "A physiological and/or behavioral recording that happens at one time" |
| **Unit** | The ROI `unit_id` within a scan | A putative neuron in extracellular ephys |
| **Bipolar cell (BPC)** | Interneuron with two opposite primary dendrites (morphology-defined) | "A subset of VIP cell with a bipolar dendritic arbor" |
| **Column (MICrONS)** | 100 µm-square densely proofread region | "Minnie column" — same thing, different headword |
| **Basket / Martinotti / Neurogliaform / SST / VIP** | Added last week, written independently | Already defined, at greater length and with the marker-expression detail |

Recommendation: adopt the databook wording for the six cell types (it is better and it is
the expert-reviewed source), and turn Session / Unit / Column into explicit
multi-sense entries rather than picking a winner.

---

## 4. How this would be represented on the site

Three changes, none of which require rewriting what exists:

**A new axis.** Dataset (`microns` / `v1dd`) is the wrong facet for physiology — a term
like `presence_ratio` belongs to a *modality*, not a volume. Add a `discipline` field
(`connectomics` / `physiology` / `both`) and let the existing dataset chip stay as-is.

**Seven new categories** (§1.1–1.7): recording modalities · signals & preprocessing ·
quality metrics · genetic & optical tools · stimuli & tasks · response properties ·
data organisation. That takes the palette from 12 to 19 colours, which is past what a
legend can carry — the category colours would need to be regrouped into families, or
the glossary split into two colour scopes selected by `discipline`.

**A `senses` field** for the §2 terms. The current `flags:["ambiguous"]` gives a ⚠ chip
but the definition still has to squeeze every sense into one paragraph. A term with
`senses: [{sense, context, source}]` would render as a short disambiguation list — which
is what "Distance", "Session" and "Experiment" actually need. This is the one code change
worth making before bulk-adding terms.

---

## 5. What this audit does not cover

- Single-cell morphology (`anatomy/single-cell-morphology/`) — skimmed, not audited.
- `practicalities/` (Code Ocean, git, pyNWB) — tooling, deliberately out of scope.
- The 2026 Good Coding / Good Analysis capsules are template stubs with no content yet.
- Definitions above are **drafts written from the databook text**, not expert-reviewed.
  Every physiology term should go past a physiologist before publishing, the same way the
  connectomics terms went to Ben and Casey.
- One inconsistency worth passing upstream rather than fixing here: the Behavioral States
  workshop links "DR Databook" to the **Visual Behavior Neuropixels** page, but Dynamic
  Routing is a different task and dataset. The databook has no Dynamic Routing chapter.
