# Review: terminology from the MICrONS tutorial

Screened 2026-08-17 against the 249 terms already in `data/terms.js`. Source repo: `~/Projects/SWDB/microns_tutorial` — 123 files read (every `.ipynb`, `.qmd`, `.md`, `.yml`), ~570k characters.

**Nothing here has been added to the glossary.** Tick a box, reword a draft in place, or strike a line, and I will apply whatever survives.

## How to read this

Definitions are **drafts**, written in the glossary's voice but not reviewed by anyone who knows the data. They define the concept rather than describe the tutorial, and mark identifiers with `<code>`. Treat the wording as a starting point and the *evidence* line as the thing to trust.

| group | meaning | count |
|---|---|---|
| **A** | clearly missing, worth adding | 51 |
| **B** | borderline — may be too niche or too generic | 11 |
| **C** | already covered, but the tutorial shows another sense | 7 |

### What I checked independently

I re-ran the already-covered test myself rather than taking it on trust: every candidate was fuzzy-matched against existing term names and against the full text of every existing definition. Five came back as possible overlaps and are marked ⚠ inline — three of them in group C, where overlapping is the entire point. I also confirmed by hand that the glossary contains no glial cell types at all, that `axon_column_truncated` is real and was missing (now fixed), and that five of the ten unlisted tables genuinely appear in the tutorial and in none of our data.


## A · Clearly missing


### ▸ Morphology — meshes & skeletons  `morphology`  (9)

#### Cover paths

`category: morphology` · Morphology — meshes & skeletons

**Draft** — A decomposition of a skeleton into non-overlapping paths, each running from an end point toward the root until it meets an already-covered vertex. Every vertex belongs to exactly one, which makes them the right primitive for plotting or walking a neuron.

**Seen in** — quickstart_notebooks/00_skeletons.ipynb and 07-cave-download-skeleton.ipynb — "a list of arrays… that in total cover the neuron without repeating a vertex".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Dendritic spine

`category: morphology` · Morphology — meshes & skeletons

**Draft** — The small protrusion that receives most excitatory input onto a pyramidal dendrite, with a head and a neck. Spine density is what separates excitatory from inhibitory cells in dendrite-based classifiers, and spine heads are the fragments most often left disconnected by segmentation.

**Seen in** — _baylor_log_reg_cell_type_coarse_v1.qmd — "it focuses on dendritic spines, a characteristic property of excitatory neurons"; _synapse_target_structure.qmd — "0 : Synapse onto spine head 1 : Synapse onto spine neck".

**Confidence** — high — currently only implicit inside synapse_target_predictions_ssa

- [ ] accept  - [ ] reword  - [ ] drop

---

#### distance_to_root

`category: morphology` · Morphology — meshes & skeletons

**Draft** — Path length along the skeleton from a vertex back to the root, in nanometres. Because many level-2 vertices collapse onto the single soma vertex, the value flattens to zero across the cell body rather than varying smoothly.

**Seen in** — quickstart_notebooks/00_skeletons.ipynb — "this flattens out at zero because 'distance' is computed along the skeleton and many graph vertices in the level 2 graph are associated with the soma vertex".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Link edges

`category: morphology` · Morphology — meshes & skeletons

**Draft** — Extra mesh edges inserted from proofreading records to bridge gaps where the segmentation was merged across a discontinuity. Without them a mesh may be several disconnected pieces; <code>mesh.add_link_edges()</code> heals it and <code>mesh.graph_edges</code> is edges plus link edges.

**Seen in** — quickstart_notebooks/06-cloudvolume-download-mesh.ipynb — "### Healing Mesh Gaps… information collected during proofreading allows one to partially repair these gaps by adding in links".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Meshwork annotation tables

`category: morphology` · Morphology — meshes & skeletons

**Draft** — The dataframes carried on <code>nrn.anno</code> and indexed to mesh and skeleton vertices: <code>pre_syn</code>, <code>post_syn</code>, <code>is_axon</code>, <code>lvl2_ids</code>, <code>segment_properties</code>, <code>vol_prop</code>. They are what lets a synapse be located along the arbor.

**Seen in** — quickstart_notebooks/00_skeletons.ipynb and 07-cave-download-skeleton.ipynb — "### Annotations… there is a consistent set of annotation tables".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Meshwork mask

`category: morphology` · Morphology — meshes & skeletons

**Draft** — A boolean array over mesh vertices that restricts a meshwork to part of a cell, applied with <code>apply_mask</code> or <code>mask_context</code> so that mesh, skeleton and annotations stay in sync. Masking by <code>anno.is_axon</code> is how axonal and dendritic path length are measured separately.

**Seen in** — quickstart_notebooks/07-cave-download-skeleton.ipynb — "you can *mask* the neuron skeleton by the type of compartment"; 00_skeletons.ipynb warns "Do not use the `nrn.mesh.apply_mask`… which will not synchronize the mask".

**Confidence** — high — note this collides with the existing ROI mask term; consider `senses`

- [ ] accept  - [ ] reword  - [ ] drop

---

#### NEURD

`category: morphology` · Morphology — meshes & skeletons

**Draft** — A package that decomposes a neuron mesh into an annotated graph of processes, spines and boutons, supporting automated proofreading and feature extraction. It is the source of the Baylor cell-type tables.

**Seen in** — tutorial_book/python-tools.ipynb — "These meshes can be decomposed and richly annotated for automated proofreading and morphological analysis of processes and spines using NEURD".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### pcg_skel

`category: morphology` · Morphology — meshes & skeletons

**Draft** — The package that builds a skeleton for a root id directly from the level-2 chunked graph, optionally attaching synapses and volumetric properties. Because it never touches the full-resolution mesh it can skeletonise very large neurons quickly.

**Seen in** — quickstart_notebooks/07-cave-download-skeleton.ipynb — "`pcg_skel` is a package used to rapidly build neuronal skeletons… By harnessing the way the structural data is stored".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Spectral shape analysis (HKS)

`category: morphology` · Morphology — meshes & skeletons

**Draft** — Shape descriptors computed from the heat kernel on a mesh, invariant to how the surface is bent. A random forest on these features drives the spine/shaft/soma predictions and the spine identification in <code>synapse_spine_mapping_v2</code>.

**Seen in** — _synapse_target_predictions_ssa_v2.qmd — "a random forest trained on spectral shape analysis features from the mesh"; release_manifests/version-1718.ipynb — "HKS Feature Spine Classification".

**Confidence** — medium — the tutorial names it but does not expand HKS

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Cell types & cortical anatomy  `celltypes`  (9)

#### Astrocyte

`category: celltypes` · Cell types & cortical anatomy

**Draft** — A non-neuronal cell whose fine processes tile the neuropil and wrap capillaries with endfeet. In this data "clean" for an astrocyte means neurites and non-astrocytic elements were removed, and "extended" means the processes inside its territory were reviewed — a different standard from a proofread neuron.

**Seen in** — _annotation_tables/_vortex_astrocyte_proofreading_status.qmd; vortex-year-2.ipynb — "Three apposed, cleaned astrocytes… with a branch of the capillary (red) wrapped by the endfeet of two astrocytes".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Chandelier cell (ChC)

`category: celltypes` · Cell types & cortical anatomy

**Draft** — A PV interneuron that synapses exclusively onto the axon initial segments of pyramidal cells, giving it a distinctive cartridge-like axonal arbor. Appears as its own label in <code>cell_type_multifeature_combo</code>.

**Seen in** — _annotation_tables/_cell_type_multifeature_combo.qmd — "| `ChC` | Inhibitory | Chandelier cells |"; background.ipynb links an example chandelier cell.

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### MET-type

`category: celltypes` · Cell types & cortical anatomy

**Draft** — A cell type defined jointly by morphology, electrophysiology and transcriptomics in patch-seq data. <code>gamlin_2023_mcs_met_types</code> assigns a predicted MET-type label to reconstructed Martinotti cells, with the classifier's cross-validation agreement as the confidence value.

**Seen in** — _annotation_tables/_gamlin_2023_mcs_met_types.qmd — "link the EM and MET-types (morphology, electrophysiology, transcriptomic cell types)".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Microglia

`category: celltypes` · Cell types & cortical anatomy

**Draft** — The resident immune cell of the brain, which contacts and engulfs synapses. Sixty were proofread in the V1 column; "clean" means non-microglial elements were removed and "extended" means every endpoint was followed.

**Seen in** — _vortex_microglia_proofreading_status.qmd; vortex-year-3.ipynb — "Zoom in on one microglia (orange) enveloping a synapse between neurons".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Multifeature cell types

`category: celltypes` · Cell types & cortical anatomy

**Draft** — The labelling scheme of <code>cell_type_multifeature_combo</code>, combining somatic, dendritic and spine features. Excitatory labels are layer plus projection class (<code>L2IT</code>…<code>L6CT</code>); inhibitory labels split more finely than the mtypes (<code>NMC</code>, <code>ChC</code>, <code>PV</code>, <code>AltBasket</code>, <code>AltDTC</code>, <code>ITCperi</code>, <code>L1</code>).

**Seen in** — _annotation_tables/_cell_type_multifeature_combo.qmd; release_manifests/version-1718.ipynb — "an updated cell typing based on the combination of soma, dendrite, and spine features".

**Confidence** — high — newest release adds it; distinct from existing 'mtypes'

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Neuromodulatory axon

`category: celltypes` · Cell types & cortical anatomy

**Draft** — A long-range axon of putative neuromodulatory origin, recognised in EM by boutons packed with large secretory vesicles and by branching in layer 1. Tracked in <code>vortex_peptidergic_proofreading_status</code>.

**Seen in** — _vortex_peptidergic_proofreading_status.qmd — "long-range putative neuromodulatory axons. Distinguished by boutons with large secretory vesicles"; vortex-year-2.ipynb.

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Non-neuronal cell types

`category: celltypes` · Cell types & cortical anatomy

**Draft** — The glial and vascular labels used in the cell-type tables: <code>astrocyte</code>, <code>microglia</code>, <code>oligo</code> (oligodendrocyte), <code>OPC</code> (oligodendrocyte precursor cell), <code>pericyte</code>. They carry <code>classification_system</code> value <code>aibs_coarse_nonneuronal</code> or <code>nonneuron</code>.

**Seen in** — tutorial_book/annotation-tables.ipynb and _aibs_column_nonneuronal_ref.qmd — "Manual Cell Types (non-neurons)" table.

**Confidence** — high — mirrors the existing 'Excitatory/Inhibitory V1 cell types' grouped entries

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Soma-nucleus model

`category: celltypes` · Cell types & cortical anatomy

**Draft** — The hierarchical classifier behind the <code>aibs_metamodel_*</code> tables, trained on perisomatic features — soma volume and synapse density, nucleus volume and folding, cortical depth. It covers nearly every complete cell body in the volume but tends to call layer 5 inhibitory neurons excitatory.

**Seen in** — _aibs_metamodel_celltypes_v661.qmd — "a hierarchical classifier trained on features of the cell body and nucleus… sometimes confuses layer 5 inhibitory neurons as being excitatory"; _allen_soma_coarse_cell_class_model_v1.qmd lists the features.

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Thalamocortical axon

`category: celltypes` · Cell types & cortical anatomy

**Draft** — An axon entering the volume from thalamus, with no cell body in the data. They are identified by hand and tracked in <code>vortex_thalamic_proofreading_status</code>, keyed by the point where the axon enters the EM volume rather than by a soma.

**Seen in** — _annotation_tables/_vortex_thalamic_proofreading_status.qmd — "a manually selected subset of putative thalamocortical axons… Bound spatial point columns associated with the entry point of the axon into the EM volume".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ CAVE — access & versioning  `cave`  (7)

#### BossDB / DANDI

`category: cave` · CAVE — access & versioning

**Draft** — The two public archives holding the bulk MICrONS downloads: BossDB for imagery, segmentation, meshes, skeletons and the DataJoint dump; DANDI for the two-photon recordings as NWB.

**Seen in** — tutorial_book/static-repositories.ipynb cloudpaths throughout; faq.ipynb — "[Bossdb] for MICrONS aligned volume data; [DANDI] for functional NWB files".

**Confidence** — medium — could equally be two entries

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Lineage graph

`category: cave` · CAVE — access & versioning

**Draft** — The record of which root ids an edited object was split from or merged into. It is what lets a root id from an old analysis be mapped forward or backward in time, via <code>client.chunkedgraph.get_lineage_graph()</code>.

**Seen in** — tutorial_book/materialization-version.ipynb — "there is a **lineage graph** of changes to the dataset… you can find the past version of your cell… as long as you know the **root id**"; a dedicated "### Lineage Graphs" section.

**Confidence** — high — has its own heading and figure

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Major version

`category: cave` · CAVE — access & versioning

**Draft** — A materialization version designated permanent (MICrONS v117, v943, v1300). Other versions expire roughly a year after release and survive only as static file downloads.

**Seen in** — tutorial_book/materialization-version.ipynb — "The following are considered **major versions** and WILL NOT expire"; "Access archived data versions".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Release manifest

`category: cave` · CAVE — access & versioning

**Draft** — The per-version note listing which annotation tables were added, updated, or carried over in a quarterly public release.

**Seen in** — tutorial_book/release_manifests/version-1718.ipynb — "Data Release v1718 (March 7, 2026)… This version ADDS the following tables".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Skeleton service

`category: cave` · CAVE — access & versioning

**Draft** — The server-side cache of precomputed skeletons, reached with <code>client.skeleton.get_skeleton()</code> or <code>get_bulk_skeletons()</code>. A skeleton not already cached is generated on demand, which blocks for 20–60 seconds; <code>skeleton_version</code> selects the generation scheme.

**Seen in** — quickstart_notebooks/07-cave-download-skeleton.ipynb — "if the skeleton doesn't exist in the server cache, it may take 20-60 seconds to generate".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### suggest_latest_roots / is_latest_roots

`category: cave` · CAVE — access & versioning

**Draft** — ChunkedGraph calls that check whether a root id is current and propose its present-day successor by supervoxel overlap. The suggestion is a best guess: after a multi-soma split there is no unambiguous answer.

**Seen in** — tutorial_book/materialization-version.ipynb — "The ChunkedGraph will make its best guess, given supervoxel overlap, with the function `suggest_latest_roots()`".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Timestamp

> ⚠ **phrase already appears inside another definition** — check before adding.

`category: cave` · CAVE — access & versioning

**Draft** — A UTC datetime passed instead of a version to query the database at an arbitrary moment. Slower than a materialized version, because the ChunkedGraph must compute the difference from the nearest snapshot, but it is the only way to reach an expired version.

**Seen in** — tutorial_book/materialization-version.ipynb — "### How to set the timestamp to an expired version… it takes longer to materialize data from that date".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Proofreading & data quality  `proofreading`  (6)

#### Axon backtracing

`category: proofreading` · Proofreading & data quality

**Draft** — Working backwards from a synapse of interest to recover the disconnected axon that made it, rather than starting from a soma. Recorded in <code>vortex_axon_backtrace_column</code>, where the axon is keyed by the source synapse id rather than by a cell.

**Seen in** — _annotation_tables/_vortex_axon_backtrace_column.qmd — "a backtracing pilot: extending the disconnected axon from a synapse of interest"; vortex-year-3.ipynb "Axon backtrace in V1 column".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Axon extension

`category: proofreading` · Proofreading & data quality

**Draft** — Proofreading that follows an axon outward from the soma, reattaching segments at each break. It is what turns a clean axon into an extended one and is the main unit of VORTEX effort — roughly 30 hours of manual work for one excitatory cell.

**Seen in** — tutorial_book/vortex-overview.ipynb request table ("Axon extension of functionally recorded cells"); proofreading.ipynb — "Extending the axon to completion might take 30 hours of manual work".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Multi-soma merge

`category: proofreading` · Proofreading & data quality

**Draft** — A segmented object containing more than one cell body, from two cells falsely merged. It shows up as duplicate <code>pt_root_id</code> rows in a nucleus-referenced table, and is routinely dropped before analysis.

**Seen in** — quickstart_notebooks/03-cave-query-proofread-cells.ipynb — "we might see duplicates from multi-soma merges… For analytical simplicity, we will drop any multi-soma objects"; cell-type table docs "with small-objects and multi-soma errors removed".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Path swap

`category: proofreading` · Proofreading & data quality

**Draft** — A merge error in which two or more axons cross and exchange identity, so each reconstruction follows the wrong branch onward. Fixing it takes a combination of split and merge operations.

**Seen in** — tutorial_book/proofreading.ipynb figure caption — "correcting 'path swaps' where two or more axons become falsely-merged together, confusing their connectivity".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Synapse reattachment

`category: proofreading` · Proofreading & data quality

**Draft** — Reconnecting a detected synapse whose postsynaptic side was left orphaned by segmentation — usually a spine head split from its dendrite. Outcomes are logged in <code>vortex_synapse_reattachment</code> as <code>spine</code>, <code>dendrite</code>, <code>disconnected</code>, or <code>error</code>.

**Seen in** — _annotation_tables/_vortex_synapse_reattachment.qmd — "a subset of synapses in the V1 column that were not connected to a postsynaptic soma… evaluated for reattachment".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### valid_id

> ⚠ **phrase already appears inside another definition** — check before adding.

`category: proofreading` · Proofreading & data quality

**Draft** — The root id an object had when a manual assessment was made. If it no longer matches <code>pt_root_id</code>, the cell has been edited since and the annotation may no longer describe the current object.

**Seen in** — _annotation_tables/_proofreading_status_and_strategy.qmd — "NOTE: if this does not match the `pt_root_id` then the cell has undergone further changes"; _vortex_manual_myelination_v0.qmd — "the segmentation root_id associated with this assessment is the valid_id, NOT necessarily the `pt_root_id`".

**Confidence** — high — repeatedly flagged with a warning callout

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Segmentation & reconstruction  `segmentation`  (5)

#### Expired root id

`category: segmentation` · Segmentation & reconstruction

**Draft** — A root id that no longer exists in the current segmentation because the object was edited. Querying it returns nothing; use <code>suggest_latest_roots()</code> or query at the timestamp where it was valid.

**Seen in** — tutorial_book/materialization-version.ipynb — "if that `pt_root_id` is *expired*, then you may not find that object in current Annotation Tables"; FAQ "My cell disappeared".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Flat segmentation

`category: segmentation` · Segmentation & reconstruction

**Draft** — A frozen, non-editable copy of the segmentation at one version, served as <code>precomputed://</code> with downsampled meshes. Faster to read than the live graphene segmentation, but only some versions have one — v1822 does not.

**Seen in** — tutorial_book/static-repositories.ipynb "### Flat Segmentation… the fixed state of the cellular segmentation at each version"; 06-cloudvolume-download-mesh.ipynb warning — "1822 does not have a **flat segmentation**".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Nucleus segmentation

`category: segmentation` · Segmentation & reconstruction

**Draft** — A separate convolutional-network segmentation of cell nuclei, independent of the cell segmentation. Its detections define the stable nucleus ids in <code>nucleus_detection_v0</code>; detections under 25 µm³ were discarded as false positives.

**Seen in** — _annotation_tables/_nucleus_detection_v0.qmd — "Distinct from the neuronal segmentation, a convolutional neural network was trained to segment nuclei"; static-repositories.ipynb "Only included nucleus detections of volume>25 um^3".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Orphan neurite

`category: segmentation` · Segmentation & reconstruction

**Draft** — A fragment of axon or dendrite that is not attached to any cell body in the volume. Its synapses are real but cannot be assigned to a cell, so orphans are a labelled category in manual synapse-target annotation.

**Seen in** — _annotation_tables/_vortex_compartment_targets.qmd — "'spine', 'shaft', 'soma', 'soma_spine', 'orphan', 'other'. Orphan refers to orphan neurites".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Watershed segmentation

`category: segmentation` · Segmentation & reconstruction

**Draft** — The supervoxel layer of the reconstruction: the fine over-segmentation produced by the affinity network before supervoxels are agglomerated into cells. Published separately from the cell segmentation, at ~42 TB for MICrONS.

**Seen in** — tutorial_book/static-repositories.ipynb — "The individual supervoxels predicted by the affinity network before they were agglomerated by the automated segmentation".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Imaging & ultrastructure  `imaging`  (5)

#### Bouton

`category: imaging` · Imaging & ultrastructure

**Draft** — The swelling along an axon that holds the vesicle pool of a presynaptic terminal. Bouton content is diagnostic in EM: ordinary small clear vesicles versus the large dense-core vesicles of a neuromodulatory axon.

**Seen in** — _vortex_peptidergic_proofreading_status.qmd and vortex-year-2.ipynb — "distinguished by boutons with large secretory vesicles"; _synapse_target_structure.qmd value 4 "Synapse onto axonal bouton".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Dense core vesicle

`category: imaging` · Imaging & ultrastructure

**Draft** — A large vesicle with an electron-dense core, carrying neuropeptides rather than fast transmitter. Sparse enough in cortex that a VORTEX pilot to annotate them was abandoned pending automated organelle segmentation.

**Seen in** — tutorial_book/vortex-year-2.ipynb — "This annotation task terminated after a feasibility pilot, due to the difficulty in finding very sparse dense core vesicles".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### MicroCT

`category: imaging` · Imaging & ultrastructure

**Draft** — X-ray micro-tomography of the resin block before sectioning, used to check the tissue and to guide alignment of the EM sections into a volume.

**Seen in** — tutorial_book/background.ipynb — "imaged using two-photon microscopy, microCT, and serial electron microscopy"; static-repositories.ipynb — "MicroCT used for inspection and alignment".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Myelin

`category: imaging` · Imaging & ultrastructure

**Draft** — The oligodendrocyte sheath around an axon, visible in EM as dark concentric wrapping. Detected automatically by asking what fraction of an axon's outline is bordered by unsegmented space (<code>myelin_auto_tags_2points</code>) and labelled by hand in <code>vortex_manual_myelination_v0</code>.

**Seen in** — _annotation_tables/_myelin_auto_tags_2points.qmd — "evaluates the proportion of the segmentation outline adjacent to segment == 0".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Node of Ranvier

`category: imaging` · Imaging & ultrastructure

**Draft** — The unmyelinated gap between two myelin segments on an axon. Annotated where myelination disappears and reappears within 5 µm, in <code>vortex_manual_nodes_of_ranvier</code>.

**Seen in** — _annotation_tables/_vortex_manual_nodes_of_ranvier.qmd — "nodes were suggested where myelination disappeared and reappeared within 5 um".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Annotation tables, IDs & queries  `tables`  (3)

#### Book-keeping columns

`category: tables` · Annotation tables, IDs & queries

**Draft** — Columns present in most tables for internal state rather than biology: <code>id</code>, <code>created</code>, <code>valid</code>, <code>target_id</code>, and the <code>_ref</code>-suffixed duplicates that a reference table carries for its own annotation.

**Seen in** — tutorial_book/annotation-tables.ipynb — "### Book-keeping Columns… mostly used as internal book-keeping" with a table of each.

**Confidence** — high — the tutorial pauses to explain them

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Content-aware query

`category: tables` · Annotation tables, IDs & queries

**Draft** — The <code>client.materialize.tables.&lt;table_name&gt;(&lt;filters&gt;).query(&lt;options&gt;)</code> interface, where each table exposes its own columns as filter arguments — as opposed to the generic <code>query_table</code> plus <code>filter_in_dict</code>.

**Seen in** — Every file in tutorial_book/_annotation_tables/ ends with a "# Standard query" / "# Content-aware query" pair; 00_cave_quickstart.ipynb calls it the "table manager" interface.

**Confidence** — high — the phrase is used verbatim ~40 times

- [ ] accept  - [ ] reword  - [ ] drop

---

#### View

`category: tables` · Annotation tables, IDs & queries

**Draft** — A server-side join of several annotation tables exposed as one queryable object, reached with <code>client.materialize.query_view()</code> or <code>client.materialize.views</code>. <code>nucleus_detection_lookup_v1</code> merges the nucleus table with its corrections; <code>aibs_cell_info</code> is a "super view" combining cell-type tables with their correction tables.

**Seen in** — tutorial_book/release_manifests/version-1718.ipynb — "hierarchically incorporated in the super view of cell type: `aibs_cell_info`"; examples/skeleton_load_and_generate.ipynb uses <code>query_view('nucleus_detection_lookup_v1')</code>.

**Confidence** — high — distinct from the existing Neuroglancer/Dash 'viewer' terms

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Connectivity & synapses  `connectivity`  (3)

#### Autapse

`category: connectivity` · Connectivity & synapses

**Draft** — A synapse from a neuron onto itself. Most appear in the synapse table as a by-product of merge errors or detection noise, so synapse queries offer <code>remove_autapses</code>.

**Seen in** — quickstart_notebooks/04-cave-query-synapses.ipynb — <code>client.materialize.synapse_query(..., remove_autapses=True)</code>.

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Spine / shaft / soma target

`category: connectivity` · Connectivity & synapses

**Draft** — The postsynaptic compartment a synapse lands on. The distinction separates the perisomatic targeting of basket cells from the dendritic targeting of Martinotti cells, and is the label predicted in <code>synapse_target_predictions_ssa_v2</code> and annotated by hand in <code>vortex_compartment_targets</code>.

**Seen in** — _vortex_compartment_targets.qmd, _synapse_target_predictions_ssa_v2.qmd — "label of the post-synaptic structure, one of: `spine`, `shaft`, `soma`".

**Confidence** — medium — overlaps the existing synapse_target_predictions_ssa entry, but that entry names a table rather than the concept

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Synaptic cleft segmentation (PSD)

`category: connectivity` · Connectivity & synapses

**Draft** — The voxel segmentation of each detected postsynaptic density, one label per synapse. The <code>size</code> column of the synapse table is a voxel count of this object, and <code>ctr_pt_position</code> is its centre of mass.

**Seen in** — tutorial_book/static-repositories.ipynb — "Voxel segmentation of each synapse (post-synaptic density - PSD) detected"; "`id`: corresponds to the ID from the PSD segmentation volume".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Functional data & coregistration  `functional`  (2)

#### DataJoint

`category: functional` · Functional data & coregistration

**Draft** — The relational framework the MICrONS functional data is distributed in — calcium traces, stimulus movies, behaviour and inferred spikes live in a containerised MySQL database, not in CAVE. The two halves are joined on <code>session</code> / <code>scan_idx</code> / <code>unit_id</code> through a coregistration table.

**Seen in** — tutorial_book/functional-data.ipynb — "The functional data is all in DataJoint, while the EM data is all in CAVE. The two datasets are merged on the unit ID".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### In silico response

`category: functional` · Functional data & coregistration

**Draft** — A response predicted by the digital twin rather than recorded from the animal. Because the twin can be shown any stimulus, tuning values in the <code>digital_twin_properties_*</code> tables are measured on model output, not on the calcium traces.

**Seen in** — programmatic_access/functional_tutorial/em_functional_intro.md — "A collection of *in silico* model responses of neurons to a variety of visual stimuli has been precomputed".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Datasets & scope  `datasets`  (1)

#### minnie65 / minnie35

`category: datasets` · Datasets & scope

**Draft** — The two EM subvolumes cut from the MICrONS block. Nearly all released data is minnie65; minnie35 is the smaller adjacent piece, segmented separately, and the alignment between them is good enough to trace by hand but not automatically.

**Seen in** — tutorial_book/static-repositories.ipynb lists every product for both volumes; materialization-version.ipynb — "The two subvolumes of the dataset were segmented separately, but the alignment between the two is sufficient for manually tracing between them".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Stimuli & behavioural tasks  `stimuli`  (1)

#### Monet stimulus

`category: stimuli` · Stimuli & behavioural tasks

**Draft** — A parametric textured movie of correlated motion, varying in orientation and spatial frequency, used at Baylor to measure orientation tuning. Model responses to 16 Monet directions are the source of <code>pref_ori</code> and <code>gOSI</code>.

**Seen in** — programmatic_access/functional_tutorial/em_functional_intro.md — "Monet stimuli, a type of parametric stimulus that measures orientation tuning"; <code>monet_resp.npy</code> / <code>monet_dir.npy</code>.

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


## B · Borderline


### ▸ Annotation tables, IDs & queries  `tables`  (3)

#### Bounding box query

`category: tables` · Annotation tables, IDs & queries

**Draft** — Restricting a synapse query to a rectangular region of the volume with <code>bounding_box=[[min…],[max…]]</code>, used for spatial questions such as proximity-based null models.

**Seen in** — quickstart_notebooks/04-cave-query-synapses.ipynb — "useful if, for example, you want to find all synapses in a radius around one synapse of interest, such as for building a null-model of connectivity based on proximity".

**Confidence** — medium

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Corrections table

`category: tables` · Annotation tables, IDs & queries

**Draft** — A living reference table of manual overrides to an automated table's labels, e.g. <code>aibs_metamodel_celltypes_v661_corrections</code>. Corrections are folded into the combined view rather than edited into the original table.

**Seen in** — release_manifests/version-1718.ipynb — "a living table that contains cell_type label changes… Both corrections tables are hierarchically incorporated in the super view of cell type: `aibs_cell_info`".

**Confidence** — medium — introduced in the most recent release only

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Deprecated table

`category: tables` · Annotation tables, IDs & queries

**Draft** — A table superseded by a newer version and readable only at the materialization versions listed on it. Fully deprecated tables are no longer queryable through CAVEclient at all and survive only as static downloads.

**Seen in** — Twenty-odd files in tutorial_book/_annotation_tables/ carry a "## Deprecated table — This table remains available from materialization versions: …" callout.

**Confidence** — medium

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Cell types & cortical anatomy  `celltypes`  (2)

#### Minicolumn

`category: celltypes` · Cell types & cortical anatomy

**Draft** — A narrow vertical group of cortical neurons treated as a repeating unit of cortical organisation, and the target of the axon-backtracing effort in the V1 column.

**Seen in** — tutorial_book/vortex-overview.ipynb — "Connectivity of cortical mini-columns | Axon backtrace within V1 column"; vortex-year-3.ipynb "Axon backtracing of inputs to cortical minicolumns".

**Confidence** — medium — appears twice, never defined

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Sst-Chodl cell

`category: celltypes` · Cell types & cortical anatomy

**Draft** — A rare, sparsely branching SST subclass expressing nitric oxide synthase, implicated in synchronising cortical state. Requested for proofreading but not yet delivered.

**Seen in** — tutorial_book/vortex-overview.ipynb — "How does the connectivity pattern of SST/Chodl cells give rise to their physiological feature: synchronization of cortical states?"

**Confidence** — low — mentioned once, and the cells were never proofread

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Connectivity & synapses  `connectivity`  (2)

#### Connectivity matrix

`category: connectivity` · Connectivity & synapses

**Draft** — A square pre-by-post array built by pivoting the synapse table on <code>pre_pt_root_id</code> and <code>post_pt_root_id</code>. What it shows depends entirely on which cells were included: any row whose axon is unproofread is missing most of its connections.

**Seen in** — quickstart_notebooks/04-cave-query-synapses.ipynb — "this connectivity matrix is highly dependent on: 1. Which set of cell-type labels you include 2. Which set of proofread cells you include".

**Confidence** — medium — generic name, but the caveat is dataset-specific

- [ ] accept  - [ ] reword  - [ ] drop

---

#### net_size / mean_size

`category: connectivity` · Connectivity & synapses

**Draft** — Summed and average synapse size over a connected pair, reported alongside the synapse count in the Connectivity Viewer. Size is a proxy for connection strength, so a pair with few but large synapses is not the same as one with many small ones.

**Seen in** — tutorial_book/dash-connectivity.ipynb — "both summed total synapse size (`net_size`) and average synapse size (`mean_size`) are also shown".

**Confidence** — medium — viewer-specific column names

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Visualisation tools  `tools`  (2)

#### Linked segmentation

`category: tools` · Visualisation tools

**Draft** — The association between a Neuroglancer annotation and one or more segment ids, so that selecting the annotation loads those objects. In <code>nglui</code> it is set per layer and populated from a dataframe column.

**Seen in** — quickstart_notebooks/09-nglui-neuroglancer.ipynb — <code>PointMapper(linked_segmentation_column='linked_segmentation')</code>, <code>AnnotationLayerConfig(linked_segmentation_layer='seg')</code>.

**Confidence** — medium

- [ ] accept  - [ ] reword  - [ ] drop

---

#### skeleton_plot

`category: tools` · Visualisation tools

**Draft** — A small package that renders a skeleton or meshwork as an aligned 2D projection with compartments coloured, and optionally synapse positions overlaid.

**Seen in** — quickstart_notebooks/07-cave-download-skeleton.ipynb — "Our convenience package __skeleton_plot__ renders the skeleton in aligned, 2D views".

**Confidence** — medium

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Datasets & scope  `datasets`  (1)

#### Expanded column

`category: datasets` · Datasets & scope

**Draft** — A 50 µm annulus around the Minnie V1 column, added so that inhibitory cells whose axons reach into the column are themselves proofread.

**Seen in** — tutorial_book/vortex-year-2.ipynb — "basket cells in all layers in the expanded column, a 50 um radius around the V1 column".

**Confidence** — medium — a variant of the existing Column (MICrONS) entry; may be better as a sense there

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Segmentation & reconstruction  `segmentation`  (1)

#### Ground truth

`category: segmentation` · Segmentation & reconstruction

**Draft** — Hand-made labels used to train or score an automated method, released alongside the data — the manual segmentation used to train the reconstruction pipeline, or <code>vortex_compartment_targets</code> for the synapse-target classifier.

**Seen in** — tutorial_book/static-repositories.ipynb — "Manual ground truth labels provided for training the automated segmentation pipeline"; _vortex_compartment_targets.qmd — "provided ground truth for the automatic classifier".

**Confidence** — medium — general ML vocabulary, but with a specific referent here

- [ ] accept  - [ ] reword  - [ ] drop

---


## C · Another sense of a term we have

These are the most valuable, and the cheapest to apply: each is an edit to an existing entry, usually adding a `senses` list rather than a new term.


### ▸ Proofreading & data quality  `proofreading`  (2)

#### Clean / Extended

`category: proofreading` · Proofreading & data quality

**Draft** — Additional sense: for glia the same words mean something else. "Clean" for an astrocyte or microglion means neurites and non-glial elements were removed rather than merge errors on an arbor; "extended" means processes within the cell's own territory were reviewed, or every endpoint visited.

**Seen in** — _vortex_astrocyte_proofreading_status.qmd — "'clean' indicating neurite and non-astrocytic elements have been manually removed; 'extended' meaning astrocytic processes within the volume of the astrocyte have been comprehensively reviewed"; existing Clean/Extended entries are written for neuronal arbors.

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---

#### Strategy values  ✅ already applied

> Applied in `27e659c` — the existing entry now lists `axon_column_truncated`
> and says why it matters. Left here for the record; nothing to review.

`category: proofreading` · Proofreading & data quality

**Draft** — Gap in the existing entry: <code>axon_column_truncated</code> is missing. It means the axon was extended only within the V1 column, often cut at the column or layer boundary, so its outputs are a spatially biased sample — the most important distinction among the axon strategies.

**Seen in** — _proofreading_status_and_strategy.qmd strategy table; 00_cave_quickstart.ipynb — "The most important distinction is axons annotated with `axon_column_truncated` were only proofread within a certain volume".

**Confidence** — high — factual omission in an existing entry

---


### ▸ Functional data & coregistration  `functional`  (1)

#### Field

`category: functional` · Functional data & coregistration

**Draft** — Additional sense: in MICrONS coregistration, <code>field</code> is the index of one imaging plane within a scan. A cell scanned in more than one field matches more than one functional unit, which is why the coregistration tables contain duplicate rows for the same nucleus.

**Seen in** — _coregistration_manual_v4.qmd — "An EM nucleus centroid may have matched to more than one functional unit if it was scanned on more than one imaging field"; the existing glossary entry 'Field of view' covers only the ophys extent.

**Confidence** — high — genuinely a different meaning from field_of_view

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Annotation tables, IDs & queries  `tables`  (1)

#### id

`category: tables` · Annotation tables, IDs & queries

**Draft** — Additional sense worth recording as a disambiguation: <code>id</code> is the annotation id within whatever table you queried, so it is the nucleus id in a nucleus-referenced table, the synapse id in a synapse-referenced table, and a meaningless row counter elsewhere. Joining two tables on <code>id</code> without checking what each references is a common error.

**Seen in** — annotation-tables.ipynb — "in all cases the `id` column references the nucleus id of the cell"; _vortex_axon_backtrace_column.qmd — "`id`/`target_id` | Synapse ID for the source synapse".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Cell types & cortical anatomy  `celltypes`  (1)

#### Cell type

> ⚠ **same name as an existing term** — check before adding.

`category: celltypes` · Cell types & cortical anatomy

**Draft** — Additional sense worth recording on the existing entry: one cell carries several different labels depending on which table you ask — manual (<code>allen_v1_column_types_slanted_ref</code>), perisomatic metamodel, targeting-based mtype, GNN, multifeature. The mtype labels in particular "are not a direct mapping" to the literature.

**Seen in** — _aibs_metamodel_mtypes_v661_v2.qmd — "all cell-type labels in this table come from a clustering specific to this paper, and while they are intended to align with the broader literature they are not a direct mapping".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Morphology — meshes & skeletons  `morphology`  (1)

#### Mask

`category: morphology` · Morphology — meshes & skeletons

**Draft** — Additional sense: alongside the ophys ROI mask, 'mask' in the connectomics tools means a boolean array over mesh vertices used to restrict a meshwork or mesh. A third use appears in the skeleton metadata, where an unproofread cell's axon is 'masked out' of the released skeleton entirely.

**Seen in** — static-repositories.ipynb — "the axon is not biologically accurate and has therefore been masked and removed"; 06-cloudvolume-download-mesh.ipynb "### Masking".

**Confidence** — high

- [ ] accept  - [ ] reword  - [ ] drop

---


### ▸ Datasets & scope  `datasets`  (1)

#### Column (MICrONS)

> ⚠ **same name as an existing term** — check before adding.

`category: datasets` · Datasets & scope

**Draft** — Additional sense worth recording: 'the column' also names the 50 µm-wider 'expanded column' used for inhibitory-cell proofreading, and 'minicolumn' is a different, finer anatomical unit.

**Seen in** — vortex-year-2.ipynb — "in the expanded column, a 50 um radius around the V1 column".

**Confidence** — medium

- [ ] accept  - [ ] reword  - [ ] drop

---


## Two things outside the term list

**The MICrONS version is stale.** `data/config.js` pins `version: "v1507"`, dated 2025-07-31. The tutorial lists 1507 → 1621 → **1718** (2026-03-07) and instructs `client.version = 1718`, with v1822 announced. Which release the glossary should name is a call for you — naming the wrong one is worse than naming an old one.

**Ten MICrONS tables are undocumented here.** `vortex_compartment_targets`, `vortex_manual_myelination_v0`, `vortex_manual_nodes_of_ranvier`, `vortex_microglia_proofreading_status`, `vortex_axon_backtrace_column`, `vortex_synapse_reattachment`, `myelin_auto_tags_2points`, `synapse_spine_mapping_v2`, `cell_type_multifeature_combo`, `aibs_cell_info`. Also `synapse_target_predictions_ssa` is superseded by `_v2` in v1718.
