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
  DYNAMIC_KEYMAP_GET_KEYCODE: 0x04,  // Vial/legacy protocol v9-v11用：1キーずつ取得
} as const;

// Vial command prefix and keyboard definition commands
export const VIAL_PREFIX = 0xfe;
export const VIAL_COMMAND = {
  GET_KEYBOARD_ID: 0x00,
  GET_SIZE: 0x01,
  GET_DEFINITION: 0x02,
  GET_ENCODER: 0x03,
  SET_ENCODER: 0x04,
  GET_UNLOCK_STATUS: 0x05,
  UNLOCK_START: 0x06,
  UNLOCK_POLL: 0x07,
  LOCK: 0x08,
  QMK_SETTINGS_QUERY: 0x09,
  QMK_SETTINGS_GET: 0x0a,
  QMK_SETTINGS_SET: 0x0b,
  QMK_SETTINGS_RESET: 0x0c,
  DYNAMIC_ENTRY_OP: 0x0d,
} as const;

// Keyboard value IDs
export const KEYBOARD_VALUE = {
  UPTIME: 0x01,
  LAYOUT_OPTIONS: 0x02,
  SWITCH_MATRIX_STATE: 0x03,
} as const;

// プロトコルバージョン
export const MIN_VIAL_COMPAT_PROTOCOL_VERSION = 0x09;
export const MIN_VIA_PROTOCOL_VERSION = 0x0c;

// バッファサイズ
export const VIA_BUFFER_CHUNK_SIZE = 28;  // Remapと同じチャンクサイズ
export const VIA_REPORT_SIZE = 32;        // VIAレポートサイズ
