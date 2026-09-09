# 画像アセットの運用ルール

このフォルダの画像は **配信サイズを抑えるため WebP 版を必ず用意する** 構成になっています。
生成は `scripts/optimize-images.py` が行います。手作業でリサイズ・変換する必要はありません。

## 生成方法

```bash
pip install Pillow
python3 scripts/optimize-images.py
```

スクリプトは元画像を上書き・縮小するため、**元画像の状態から 1 回だけ**実行してください。
すでに生成済みのファイルに再実行すると多重エンコードで画質が落ちます。やり直す場合は
`git checkout -- assets/images` で元に戻してから実行してください。

## 画像を差し替えるとき

1. 差し替えたい画像を、下表の「元ファイル」と同じ名前でこのフォルダに置く
2. `python3 scripts/optimize-images.py` を実行する
3. 生成された `.webp` / `.jpg` も含めてコミットする

テンプレート側（`src/app.component.html`）は `<picture>` で WebP を優先し、
非対応ブラウザには `.jpg` / `.png` を配信します。`<img>` には必ず `width` / `height` を
指定してください（レイアウトのガタつき＝CLS を防ぐため）。

## ファイル一覧

| 元ファイル | 用途 | 生成物 |
|---|---|---|
| `hero-firstview-generated.jpg` | ファーストビュー（LCP 対象） | `.webp` / `-mobile.jpg` / `-mobile.webp` |
| `join-promo-card.jpg` | 入団促進カード | `.webp` |
| `achievements-card.png` | 大会実績カード（透過あり） | `.webp` |
| `annual-schedule-card.png` | 年間予定カード（透過あり） | `.webp` |
| `about-baseball-small.png` | チーム紹介のアクセント（透過あり） | `.webp` |
| `intro-team-1.jpg` 〜 `intro-team-5.jpg` | チーム紹介・ギャラリー・背景 | `.webp` |
| `hero-team-desktop.jpg` | ギャラリーの集合写真 | `.webp` |
| `player-intro/player-01.png` 〜 `player-11.png` | 選手紹介アニメーション（透過あり） | `.webp` |
| `og-image.jpg` | OGP 画像（1200x630、自動生成） | — |
| `baseball-icon.svg` | アイコン・ファビコン | — |

`og-image.jpg` と `public/favicon.ico` / `public/apple-touch-icon.png` も
同じスクリプトが自動生成します（それぞれ `hero-firstview-generated.jpg` と
`about-baseball-small.png` が元データ）。

## 元画像を用意するときの目安

- **写真**: 長辺 1600px 程度、JPEG 品質 85 前後。スクリプトが表示サイズに合わせて縮小します
- **透過が必要なもの**: PNG（RGBA）。スクリプトが透過付き WebP を生成します
- **ファーストビュー**: 横長（およそ 2.4:1）。中央に主役が来る構図にしてください
