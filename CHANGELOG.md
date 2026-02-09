# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-09

### Added
- 対応キーボード追加（計8種類に拡大）:
  - Corne (crkbd)
  - Cornelius v2
  - ErgoArrows
  - Helix rev3 5rows
  - Keyball39
  - Keyball44
  - Lily58
- 非対応キーボードでもタイピング練習が可能に（キー配列表示なし）
- トップページにイントロダクション追加
  - アプリの特徴説明
  - 使い方ガイド
- お問い合わせガイド追加

### Changed
- キーボード選択画面のUI改善
- エラーメッセージの改善

## [1.1.1] - 2026-01-14

### Fixed
- キーマップ画像が斜めの配置も正確に表現するように修正

## [1.1.0] - 2026-01-05

### Added
- 練習素材を追加
- トップページに対応キーボード一覧を表示

### Fixed
- 一部のキー入力が認識されない問題を修正
- 外来音の入力パターンを改善
- ドロップダウンメニューが次の問題に進んだ時に自動更新されない問題を修正

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
