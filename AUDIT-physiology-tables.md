# Audit: how to represent physiology "tables"

Companion to `AUDIT-physiology-and-ambiguity.md`. This one answers a narrower
question: the Tables view was designed around CAVE annotation tables. Physiology
data is not shaped like that. What should the view show, and how.

**This document was rewritten after inspecting real files.** The first version
described the AllenSDK cache API and was assembled from databook prose. It got
things wrong — it placed the BCI trials table under `intervals`, where it is
actually under `stimulus/presentation`. Everything below now comes from the
files themselves.

## How the files were read

NWB-Zarr keeps its schema in tiny JSON sidecars, so the whole structure can be
read without downloading a single array:

```bash
# the consolidated index, usually under 100 kB
aws s3 cp --no-sign-request \
  s3://aind-open-data/<asset>/<file>.nwb/.zmetadata -

# or walk the sidecars for a file that has no .zmetadata
aws s3 cp --no-sign-request --recursive \
  --exclude "*" --include "*.zattrs" --include "*.zgroup" --include "*.zarray" \
  s3://aind-open-data/<asset>/ ./meta/
```

`.zattrs` gives each group's `neurodata_type` and, for tables, its `colnames`.
`.zarray` gives shape and dtype, which is where the row counts in the view come
from — they are measured, not quoted.

Six assets were read this way. Each is named in `data/config.js` under its
dataset's `asset` field and printed in the Tables view, so any row in the
catalogue can be checked against the file it came from.

| Dataset | Asset |
|---|---|
| V1 Deep Dive (2P) | `409828_2018-11-06_14-02-59_filtered_2026-04-09_04-59-00` |
| Brain Computer Interface | `single-plane-ophys_731015_2025-01-10_18-06-31_processed_2025-08-03_20-39-09` |
| Dynamic Foraging | `behavior_761433_2025-03-27_08-51-54_processed_2025-03-28_05-00-28` |
| NP Ultra & Psychedelics | `ecephys_714527_2024-05-15_13-00-23_nwb_2025-08-03_21-11-22` |
| Dynamic Routing | `ecephys_713655_2024-08-09_10-41-47_nwb_2026-05-18_21-59-59` |
| Cell Type Look-Up Table | `ecephys_655565_2023-03-31_14-47-36_nwb_2025-07-16_16-52-27` |

## 1. The finding: the structure is already there

Every file has the same top-level groups, whether it holds a behaving mouse
under Neuropixels or a single imaging plane:

```
/
  general/       subject · devices · extracellular_ephys/electrodes
                                   | optophysiology/ImagingPlane
  acquisition/   signals as acquired
  stimulus/      presentation/ · templates/
  intervals/     TimeIntervals tables — epochs, trials, blocks
  processing/    ProcessingModules — behavior, plane-N, ecephys
  units/         one row per sorted unit (ephys only)
  analysis/      non-standard extras
```

So the lanes should be those groups. That gives the physiology view the same
shape as the connectomics one — seven colour-coded columns — while saying
something true and identical across every dataset. Connectomics lanes answer
*what does this table record*; physiology lanes answer *where does this live*.
An empty lane is informative: V1DD has no `units` because two-photon data has
no sorted units, and no `stimulus` because it keeps its stimulus table under
`intervals`.

## 2. What differs between datasets, and why it matters

The uniform shell is the point, but so are the deviations. Each of these was a
surprise found in a file, and each is now visible in the view:

- **BCI keeps its trials under `stimulus/presentation/Trials`**, not `intervals`.
  Defensible — the lickport is driven by the neuron, so the trial *is* the
  stimulus — but nobody would guess it.
- **A "trial" is not always behavioural.** In the cell-type look-up table,
  `intervals/trials` is a laser pulse train: `site`, `power`, `wavelength`,
  `num_pulses`, `inter_pulse_interval`.
- **NP Ultra has 719 units but a 556-row `analysis/analysis_table`.** The
  curated subset lives in a non-standard group, joined on `ks_unit_id`.
- **Dynamic Routing precomputes its own performance table.** `intervals/performance`
  has one row per block with `hit_rate`, `false_alarm_rate` and
  `cross_modality_dprime` already calculated.
- **CTLUT carries the optotagging evidence per unit** —
  `internal_blue_train_best_mean_latency`, `_jitter`, `_reliability` — so the
  tagging call is reproducible rather than asserted.
- **V1DD keeps the whole processing chain**, not just the end of it: `raw`,
  `demixed`, `neuropil_fluorescence`, `neuropil_corrected`, `dff`, `events`.

## 3. What was dropped, and what that costs

The AllenSDK project caches — Visual Coding 2P, Visual Coding Neuropixels,
Visual Behavior Ophys, Visual Behavior Neuropixels — are no longer represented.
The SDK is being retired in favour of reading NWB directly, so a catalogue built
around `cache.get_ophys_experiment_table()` would document the wrong thing.

The cost is real and worth stating: those four are among the largest datasets in
the course, and they are now absent from the Tables view. They can come back the
moment their NWB packaging is inspected the same way — the structure below is
dataset-agnostic, so it is a data change, not a code change. The glossary still
defines the SDK vocabulary (`ophys experiment`, `container`, `cache`, `manifest`),
now marked as being retired.

## 4. MICrONS functional

MICrONS is the exception that proves the rule: its functional side is **not**
NWB. The coregistration and digital-twin tables live in CAVE alongside the EM,
and the two-photon scans are distributed through MICrONS Explorer. It appears as
a physiology dataset with `backend: "CAVE tables + external scans"` and no
`asset`, because there is no NWB file to read. Its entries sit in the lanes they
belong to conceptually — the coregistration tables under `units`, because they
are what gives a functional unit an identity, and the digital twin under
`analysis`.

This is the dataset that joins the two disciplines, so it is worth it being
visibly odd rather than quietly forced into the same mould.

## 5. Node shape

A connectomics entry carries `rows`. A physiology entry carries `access`: the
expression that gets you the object. Where a count is meaningful and measured it
carries `rows` too — but always for **one session**, since physiology counts are
per file, never per dataset.

## 6. Unit quality metrics — earlier question

Unchanged by this rewrite, and confirmed by the files: the metric columns are
right there on `units`, identical across the AIND-packaged datasets
(`presence_ratio`, `isi_violations_ratio`, `amplitude_cutoff`, `snr`,
`isolation_distance`, `d_prime`, `l_ratio`, `nn_hit_rate`, `silhouette`,
`rp_contamination`, `sliding_rp_violation`, `drift_*`, `sync_spike_*`), plus a
`default_qc` boolean carrying the pipeline's own verdict and `decoder_label`
carrying its cell-type call.

The databook already has a full tutorial page deriving these, so the glossary
gives one short entry per metric with a source link, and the Tables view lists
them as the key columns of `units`. No duplication of the tutorial.
