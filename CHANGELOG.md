# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-29

### Added
- WebHID APIによる自作キーボードのキーマップ自動読み込み
- カスタマイズされたキーボード配列のリアルタイム表示
- 日本語タイピング練習機能
  - ローマ字入力によるひらがな練習
  - 複数入力パターン対応（し→si/shi、ち→ti/chi など）
  - 動的パターン切り替え機能
  - 拗音（きゃ、きゅ、きょ など）の単位処理
  - 促音（っ）の2つの入力方式（子音重ね・直接入力）
- プログラミング練習機能（C#）
  - 基本記号の練習
  - キーワードの練習
  - 実践的なコードスニペット
- リアルタイムキーハイライト表示
- タイピング統計表示（正答数、誤答数、正確率）
- 複数レイヤー対応（レイヤー0-3）
- 複数単語練習モード（7セット）
- 自動進行機能

### Technical
- Nuxt 4 + Vue 3 + TypeScript
- Tailwind CSS
- GitHub Pages対応
- 初期対応キーボード: Ergo68

---

## Version Format

- MAJOR: 破壊的な変更
- MINOR: 後方互換性のある機能追加
- PATCH: 後方互換性のあるバグ修正
