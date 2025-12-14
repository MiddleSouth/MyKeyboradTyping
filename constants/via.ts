/**
 * VIAプロトコル定数
 * Remapの実装に基づく定義
 */

// VIA対応デバイスのUSAGE PAGE と USAGE
export const VIA_USAGE_PAGE = 0xff60;  // VIA Raw HID
export const VIA_USAGE = 0x61;          // VIA Protocol

// VIA Command IDs
export const VIA_COMMAND = {
  GET_PROTOCOL_VERSION: 0x01,
  GET_KEYBOARD_VALUE: 0x02,
  DYNAMIC_KEYMAP_GET_LAYER_COUNT: 0x11,
  DYNAMIC_KEYMAP_GET_BUFFER: 0x12,
} as const;

// Keyboard value IDs
export const KEYBOARD_VALUE = {
  UPTIME: 0x01,
  LAYOUT_OPTIONS: 0x02,
  SWITCH_MATRIX_STATE: 0x03,
} as const;

// プロトコルバージョン
export const MIN_VIA_PROTOCOL_VERSION = 0x0c;

// バッファサイズ
export const VIA_BUFFER_CHUNK_SIZE = 28;  // Remapと同じチャンクサイズ
export const VIA_REPORT_SIZE = 32;        // VIAレポートサイズ
