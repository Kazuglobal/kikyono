#!/usr/bin/env python3
"""assets/images 配下の画像を最適化し、WebP 版とレスポンシブ用の縮小版を生成する。

使い方:
    pip install Pillow
    python3 scripts/optimize-images.py

ヒーローと入団促進カードは、もともと透過のない巨大な PNG でしたが、初回の最適化で
JPEG に置き換え済みです（PNG では 2MB 超だったものが 200〜300KB になります）。

注意: 縮小と再エンコードは元ファイルを上書きします。生成済みのファイルに対して
再実行すると多重エンコードによる劣化が起きるため、必ず元画像の状態
（`git checkout -- assets/images` で戻した状態）から 1 回だけ実行してください。
"""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"


@dataclass
class Job:
    """1 枚の元画像から生成する派生ファイルの定義。"""

    source: str
    max_width: int | None = None
    # 出力: (拡張子, 品質, サフィックス, 追加の最大幅)
    webp_quality: int = 80
    webp_lossless: bool = False
    # フォールバックを JPEG 化する（元がアルファなし PNG のときに使う）
    jpeg_fallback: bool = False
    jpeg_quality: int = 82
    # 追加で生成するモバイル用の幅
    mobile_width: int | None = None
    extra: dict = field(default_factory=dict)


JOBS = [
    # ヒーロー（LCP 対象）: WebP + フォールバック JPEG + モバイル版
    Job("hero-firstview-generated.jpg", jpeg_fallback=True,
        webp_quality=80, jpeg_quality=82, mobile_width=900),
    # 入団促進カード
    Job("join-promo-card.jpg", max_width=1200, jpeg_fallback=True,
        webp_quality=80, jpeg_quality=84),
    # 文字が多いカード類は透過を保持したまま WebP 化（品質高め）
    Job("achievements-card.png", webp_quality=88),
    Job("annual-schedule-card.png", webp_quality=88),
    Job("about-baseball-small.png", webp_quality=88),
    # 写真: 表示サイズに対して過大なので 1100px に縮小
    *[Job(f"intro-team-{i}.jpg", max_width=1100, jpeg_fallback=True, webp_quality=78)
      for i in range(1, 6)],
    Job("hero-team-desktop.jpg", max_width=1100, jpeg_fallback=True, webp_quality=78),
    # 選手紹介（透過 PNG）: PNG はフォールバックとして残し WebP を主に配信
    *[Job(f"player-intro/player-{i:02d}.png", webp_quality=78) for i in range(1, 12)],
]


def resized(image: Image.Image, max_width: int | None) -> Image.Image:
    if max_width is None or image.width <= max_width:
        return image
    height = round(image.height * max_width / image.width)
    return image.resize((max_width, height), Image.LANCZOS)


def flatten(image: Image.Image) -> Image.Image:
    """JPEG 保存用にアルファを落とす（このリポジトリでは透過なし画像にのみ使う）。"""
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGB")
    return image


def save_webp(image: Image.Image, path: Path, quality: int) -> None:
    image.save(path, "WEBP", quality=quality, method=6)


def save_jpeg(image: Image.Image, path: Path, quality: int) -> None:
    flatten(image).save(path, "JPEG", quality=quality, optimize=True, progressive=True)


def kb(path: Path) -> int:
    return path.stat().st_size // 1024


def run_job(job: Job) -> list[str]:
    source = IMAGES / job.source
    if not source.exists():
        return [f"skip (not found): {job.source}"]

    lines = []
    before = kb(source)
    with Image.open(source) as raw:
        image = resized(raw.copy(), job.max_width)

    stem = source.with_suffix("")

    webp_path = stem.with_suffix(".webp")
    save_webp(image, webp_path, job.webp_quality)
    lines.append(f"  {webp_path.name:44} {kb(webp_path):5}KB  ({image.width}x{image.height})")

    if job.jpeg_fallback:
        jpeg_path = stem.with_suffix(".jpg")
        save_jpeg(image, jpeg_path, job.jpeg_quality)
        lines.append(f"  {jpeg_path.name:44} {kb(jpeg_path):5}KB  ({image.width}x{image.height})")
    elif source.suffix == ".png":
        # 透過を保持したまま PNG を再圧縮（フォールバック用）。
        # 再圧縮でかえって大きくなる画像があるため、小さくなったときだけ差し替える。
        candidate = source.with_suffix(".png.tmp")
        image.save(candidate, "PNG", optimize=True)
        if candidate.stat().st_size < source.stat().st_size:
            candidate.replace(source)
            lines.append(f"  {source.name:44} {kb(source):5}KB  (PNG fallback, was {before}KB)")
        else:
            candidate.unlink()
            lines.append(f"  {source.name:44} {kb(source):5}KB  (PNG fallback, 再圧縮せず)")

    if job.mobile_width:
        mobile = resized(image, job.mobile_width)
        mobile_webp = stem.with_name(stem.name + "-mobile").with_suffix(".webp")
        save_webp(mobile, mobile_webp, max(job.webp_quality - 2, 60))
        lines.append(f"  {mobile_webp.name:44} {kb(mobile_webp):5}KB  ({mobile.width}x{mobile.height})")
        mobile_jpeg = stem.with_name(stem.name + "-mobile").with_suffix(".jpg")
        save_jpeg(mobile, mobile_jpeg, job.jpeg_quality)
        lines.append(f"  {mobile_jpeg.name:44} {kb(mobile_jpeg):5}KB  ({mobile.width}x{mobile.height})")

    return [f"{job.source} ({before}KB)"] + lines


def build_og_image() -> list[str]:
    """OGP 用の 1200x630 JPEG を生成する（SVG はSNSで表示されないため）。"""
    source = IMAGES / "hero-firstview-generated.jpg"
    if not source.exists():
        return ["skip og-image (hero-firstview-generated.jpg not found)"]

    target_w, target_h = 1200, 630
    with Image.open(source) as raw:
        image = flatten(raw.copy())

    scale = max(target_w / image.width, target_h / image.height)
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    left = (image.width - target_w) // 2
    top = (image.height - target_h) // 2
    image = image.crop((left, top, left + target_w, top + target_h))

    out = IMAGES / "og-image.jpg"
    save_jpeg(image, out, 84)
    return [f"og-image.jpg {kb(out)}KB (1200x630)"]


def build_icons() -> list[str]:
    """about-baseball-small.png からファビコン / apple-touch-icon を生成する。"""
    source = IMAGES / "about-baseball-small.png"
    if not source.exists():
        return ["skip icons (about-baseball-small.png not found)"]

    lines = []
    public = ROOT / "public"
    public.mkdir(exist_ok=True)
    with Image.open(source) as raw:
        icon = raw.copy().convert("RGBA")

    # apple-touch-icon は透過に対応しないため、背景をブランドカラーで塗る
    for size, name, background in (
        (180, "apple-touch-icon.png", (90, 45, 145, 255)),
    ):
        resized_icon = icon.resize((size, size), Image.LANCZOS)
        if background:
            canvas = Image.new("RGBA", (size, size), background)
            canvas.alpha_composite(resized_icon)
            resized_icon = canvas.convert("RGB")
        resized_icon.save(public / name, "PNG", optimize=True)
        lines.append(f"public/{name} {kb(public / name)}KB ({size}x{size})")

    favicon = icon.resize((64, 64), Image.LANCZOS)
    favicon.save(public / "favicon.ico", "ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    lines.append(f"public/favicon.ico {kb(public / 'favicon.ico')}KB")
    return lines


def main() -> int:
    if not IMAGES.is_dir():
        print(f"assets/images が見つかりません: {IMAGES}", file=sys.stderr)
        return 1

    for job in JOBS:
        for line in run_job(job):
            print(line)
    for line in build_og_image():
        print(line)
    for line in build_icons():
        print(line)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
