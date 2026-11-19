# Palm Cover Studio — GTA 6-style cover art maker

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/huahhhas/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/huahhhas/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns any photo and a caption into GTA 6-style cover art —
the multi-panel poster look with bold caption lettering and a neon-sunset colour
grade — exported as a PNG to share. Made for the
[make.fun bounty](https://make.fun/bounty/gta6-cover-art-01).

Referral: https://make.fun/r/4bs5ey91

## What it does

- **Any photo:** add your own photos (or use the two included samples), click a
  photo, then click a panel to place it. Drag a panel's photo to move it, scroll
  to zoom, or use the zoom slider. Fill several panels with one photo or several.
- **Six layouts:** Vice Grid (2×2), Hero + Three, Full Bleed, Nine Panel (with a
  centre title block), Tilted Snapshots (polaroid-style), and Story Stack.
- **Five colour grades:** Sunset, Neon Vice, Golden Hour, Teal Night, Mono Noir —
  each a canvas grade with a tint overlay, plus optional film grain and vignette.
- **Lettering:** a big condensed Anton title, a Pacifico script subtitle, a badge
  ribbon and a five-star heat meter. All original — no Rockstar logo, artwork or
  font anywhere.
- **Fast and easy:** a photo to a PNG in a few clicks, in 1080 × 1080, 1080 × 1350
  and 1920 × 1080 — export one size or all three at once. Undo and redo included.
- **Offline:** static files under `app/`, no network request, no upload — your
  photos never leave your machine. Fonts are vendored under `app/fonts/` under the
  SIL Open Font License.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
the output directory and writes `dossier.json` with the vendored make.fun library.

## License

MIT. Fonts under `app/fonts/` are licensed under the SIL Open Font License 1.1
(see `OFL-Anton.txt` and `OFL-Pacifico.txt`).
