# 05 — Pretrained embeddings + transfer learning

> Two upgrades that attack the project's real bottleneck — **data poverty**
> (5 creators, 1 niche, 121 videos, ~20 EEG videos) — by borrowing signal from
> open-source models and (optionally) open-source data. Both are **additive**:
> the existing hand-feature pipeline is untouched and still the default.

## 1. Pretrained embeddings as features  (`extract_embeddings.py`)

Hand-crafted brightness/colorfulness/loudness have a low predictive ceiling and
overfit at N≈120. We add a **frozen large-model embedding** per window, at the
same 0.5s cadence as `features/<id>/<id>.json`, so each embedding row aligns 1:1
with a hand-feature row.

| Modality | Model (open) | Dim | Per |
|---|---|---|---|
| Image/frame | `google/siglip-base-patch16-224` | 768 | window |
| Audio | `laion/clap-htsat-unfused` | 512 | window (1.5s clip) |

```bash
pip install -r model/requirements.txt        # adds torch, transformers, sentencepiece, Pillow
python3 model/extract_embeddings.py            # writes model/embeddings/<id>.npz (gitignored)
python3 model/extract_embeddings.py --limit 5  # quick smoke test
```

First run downloads ~1GB of checkpoints. Uses Apple MPS automatically (`--device cpu` to force).

**Use them** (PCA fits *inside* each CV fold — no leakage):

```bash
# M2 — EEG / interest curve
python3 model/train_interest.py --per-window hardware/analysis/out/ALL_per_window.csv --embeddings
python3 model/train_interest.py --per-window hardware/analysis/out/ALL_per_window.csv --embeddings --no-hand

# M1 — virality / engagement (pooled mean+std per video)
python3 model/train_virality.py --embeddings
```

Flags: `--emb-kinds siglip,clap`, `--emb-pca N`, `--head ridge|hgb`, `--no-hand` (M2 only).
The embedding block is reduced with PCA (default 48 for M2, 24 for M1) before a
ridge head — the canonical small-N recipe. Hand features keep their SHAP/importance
story; embeddings do the predicting.

## 2. Transfer learning  (`train_interest_transfer.py`)

The EEG target is tiny. Because embeddings are a **shared feature space**, we can
pretrain an `embedding → retention` head on a large-N source and carry that prior
into the EEG model. Reported as an honest ablation:

```
[0] baseline   LOVO train-mean
[1] hand       hand features only          (the current bar)
[2] emb        embeddings only
[3] hand+emb   both
[4] transfer   hand + source-pretrained prior feature   ← the lift
```

Method = **prior-feature stacking**: per held-out EEG video V, the source head is
refit on source-minus-V, and its per-window prediction becomes one feature for the
EEG ridge. V never informs its own prior → no leakage. (Scale-invariant, so a
behavioral-retention source transfers cleanly to the interest target.)

```bash
# Source = in-hand app retention (runs now, no download)
python3 model/train_interest_transfer.py \
    --per-window hardware/analysis/out/ALL_per_window.csv --source behavioral
```

Outputs: `model/out/m2t_results.json`, `m2t_ablation.png` (bar per variant),
`m2t_overlay.png` (transfer prediction vs EEG truth, representative held-out video).

### Open-data source (MicroLens) — opt-in

KuaiRec was the obvious "more watch-time data" pick but ships **no raw videos**, so
its items can't be embedded into our space and can't feed the MP4 demo. **MicroLens**
ships raw videos, so we run the *same* extractor over it.

```bash
python3 model/datasets_external/fetch_microlens.py --print-instructions   # where to download
# after placing mp4s + interactions:
python3 model/datasets_external/fetch_microlens.py --interactions PAIRS.csv \
    --videos-dir model/datasets_external/videos/microlens --make-feature-stubs \
    --features-dir model/datasets_external/videos/microlens
python3 model/extract_embeddings.py \
    --videos-dir model/datasets_external/videos/microlens \
    --features-dir model/datasets_external/videos/microlens \
    --out-dir model/datasets_external/emb/microlens
python3 model/train_interest_transfer.py --source external \
    --source-labels model/datasets_external/labels.csv \
    --src-emb-dir model/datasets_external/emb/microlens
```

## Results — first run (2026-06-28, 121 videos embedded)

Leave-one-video-out, mean per-video Pearson r (does the predicted curve track shape):

| Model | hand (was) | + embeddings |
|---|---|---|
| **M2 EEG interest** (19–21 vids, ~300–340 windows) | **+0.006** | **+0.160** |
| M1 IG engagement_rate (121 vids, 5 creators) | ~0.03 within-creator | ~0.02 (no change) |

Transfer ablation (M2 EEG, behavioral source, fair add-on test):

| baseline | hand | emb | hand+emb | hand+emb+prior (transfer) |
|---|---|---|---|---|
| nan | +0.005 | +0.137 | **+0.160** | +0.152 |

**Takeaways (honest):**
1. **Embeddings are the win for the hero (M2):** EEG interest-curve tracking went from
   ~0 (the documented null) to +0.16 per-video Pearson. The curve shape now follows the brain signal.
2. **Embeddings do NOT rescue M1 virality.** That ceiling is a *label* problem
   (IG engagement is creator/reach-confounded; only 5 creators) — not fixable with better features.
3. **In-hand behavioral→EEG transfer adds nothing** beyond embeddings (+0.155 from
   emb, −0.007 from the behavioral prior). Behavioral retention is a monotonic
   drop-off; EEG interest is dynamic, so the prior is redundant. The plumbing is
   verified — which is exactly why the **MicroLens external source is the real
   transfer opportunity** (diverse engagement labels, not in-distribution retention).
   MAE/R² stay below the flat-mean baseline at N=19 videos; per-video curve correlation
   is the metric that improved. Read all transfer numbers as directional until more EEG lands.

## Honesty guardrails (unchanged)

- Group/leave-one-video-out CV; PCA refit per fold; baselines always shown.
- EEG `interest_0_1` labelled **provisional / relative** in every caption.
- Small N stated openly — transfer numbers are **directional plumbing** until more
  EEG sessions land, not calibrated claims.
