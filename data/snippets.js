// snippets.js — short recipes shown on the Tables page and on the printed sheet.
//
// Each snippet carries one block per language. Only the languages present here
// get a tab, so adding an "r" key to a snippet is all it takes to light up an
// R tab for it — nothing in the site needs changing.

window.LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "r",      label: "R" },
];

window.SNIPPETS = [
  {
    id: "setup",
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
    title: "Restrict to proofread arbors",
    python: `pr = client.materialize.query_table("proofreading_status_and_strategy")

clean_axons = pr[pr.status_axon]        # merges removed; may be incomplete
complete    = pr[pr.strategy_axon.isin(["axon_fully_extended",
                                        "axon_interareal"])]

# valid_id is the root id at the time of assessment — if it differs from the
# current pt_root_id, the cell has been edited since.`,
  },
];
