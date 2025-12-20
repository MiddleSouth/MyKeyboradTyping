/**
 * QMKキーコードを人間が読める形式に変換するユーティリティ
 * 参考: https://github.com/qmk/qmk_firmware/blob/master/docs/keycodes.md
 */

/** 基本キーコードマップ (0x0004 - 0x00A4) */
const BASIC_KEYCODES: Record<number, string> = {
  0x0000: 'NO',      // KC_NO
  0x0001: 'TRNS',    // KC_TRNS (Transparent)
  
  // 文字キー A-Z
  0x0004: 'A',
  0x0005: 'B',
  0x0006: 'C',
  0x0007: 'D',
  0x0008: 'E',
  0x0009: 'F',
  0x000A: 'G',
  0x000B: 'H',
  0x000C: 'I',
  0x000D: 'J',
  0x000E: 'K',
  0x000F: 'L',
  0x0010: 'M',
  0x0011: 'N',
  0x0012: 'O',
  0x0013: 'P',
  0x0014: 'Q',
  0x0015: 'R',
  0x0016: 'S',
  0x0017: 'T',
  0x0018: 'U',
  0x0019: 'V',
  0x001A: 'W',
  0x001B: 'X',
  0x001C: 'Y',
  0x001D: 'Z',
  
  // 数字キー 1-0
  0x001E: '1',
  0x001F: '2',
  0x0020: '3',
  0x0021: '4',
  0x0022: '5',
  0x0023: '6',
  0x0024: '7',
  0x0025: '8',
  0x0026: '9',
  0x0027: '0',
  
  // 特殊キー
  0x0028: 'ENT',     // Enter
  0x0029: 'ESC',     // Escape
  0x002A: 'BSPC',    // Backspace
  0x002B: 'TAB',     // Tab
  0x002C: 'SPC',     // Space
  0x002D: 'MINS',    // - and _
  0x002E: 'EQL',     // = and +
  0x002F: 'LBRC',    // [ and {
  0x0030: 'RBRC',    // ] and }
  0x0031: 'BSLS',    // \ and |
  0x0033: 'SCLN',    // ; and :
  0x0034: 'QUOT',    // ' and "
  0x0035: 'GRV',     // ` and ~
  0x0036: 'COMM',    // , and <
  0x0037: 'DOT',     // . and >
  0x0038: 'SLSH',    // / and ?
  0x0039: 'CAPS',    // Caps Lock
  
  // ファンクションキー
  0x003A: 'F1',
  0x003B: 'F2',
  0x003C: 'F3',
  0x003D: 'F4',
  0x003E: 'F5',
  0x003F: 'F6',
  0x0040: 'F7',
  0x0041: 'F8',
  0x0042: 'F9',
  0x0043: 'F10',
  0x0044: 'F11',
  0x0045: 'F12',
  
  // システムキー
  0x0046: 'PSCR',    // Print Screen
  0x0047: 'SCRL',    // Scroll Lock
  0x0048: 'PAUS',    // Pause
  0x0049: 'INS',     // Insert
  0x004A: 'HOME',    // Home
  0x004B: 'PGUP',    // Page Up
  0x004C: 'DEL',     // Delete
  0x004D: 'END',     // End
  0x004E: 'PGDN',    // Page Down
  
  // 矢印キー
  0x004F: 'RGHT',    // Right Arrow
  0x0050: 'LEFT',    // Left Arrow
  0x0051: 'DOWN',    // Down Arrow
  0x0052: 'UP',      // Up Arrow
  
  // テンキー
  0x0053: 'NUM',     // Num Lock
  0x0054: 'PSLS',    // Keypad /
  0x0055: 'PAST',    // Keypad *
  0x0056: 'PMNS',    // Keypad -
  0x0057: 'PPLS',    // Keypad +
  0x0058: 'PENT',    // Keypad Enter
  0x0059: 'P1',      // Keypad 1
  0x005A: 'P2',      // Keypad 2
  0x005B: 'P3',      // Keypad 3
  0x005C: 'P4',      // Keypad 4
  0x005D: 'P5',      // Keypad 5
  0x005E: 'P6',      // Keypad 6
  0x005F: 'P7',      // Keypad 7
  0x0060: 'P8',      // Keypad 8
  0x0061: 'P9',      // Keypad 9
  0x0062: 'P0',      // Keypad 0
  0x0063: 'PDOT',    // Keypad .
  
  // モディファイアキー
  0x00E0: 'LCTL',    // Left Control
  0x00E1: 'LSFT',    // Left Shift
  0x00E2: 'LALT',    // Left Alt
  0x00E3: 'LGUI',    // Left GUI (Windows/Command)
  0x00E4: 'RCTL',    // Right Control
  0x00E5: 'RSFT',    // Right Shift
  0x00E6: 'RALT',    // Right Alt
  0x00E7: 'RGUI',    // Right GUI
};

/** Quantum Keycodes レンジ */
const QK_MODS = 0x0100;           // 0x0100-0x1FFF: Modded keycodes
const QK_MOD_TAP = 0x2000;        // 0x2000-0x3FFF: Mod-Tap
const QK_LAYER_TAP = 0x4000;      // 0x4000-0x4FFF: Layer Tap
const QK_TO = 0x5000;             // 0x5000-0x501F: Layer switch (TO)
const QK_MOMENTARY = 0x5100;      // 0x5100-0x511F: Momentary layer (MO)
const QK_DEF_LAYER = 0x5200;      // 0x5200-0x521F: Default layer (DF)
const QK_TOGGLE_LAYER = 0x5300;   // 0x5300-0x531F: Toggle layer (TG)
const QK_ONE_SHOT_LAYER = 0x5400; // 0x5400-0x541F: One-shot layer (OSL)
const QK_ONE_SHOT_MOD = 0x5500;   // 0x5500-0x557F: One-shot mod (OSM)
const QK_LAYER_TAP_TOGGLE = 0x5800; // 0x5800-0x581F: Layer tap toggle (TT)

/**
 * キーコードを人間が読める形式に変換
 * @param keycode 16ビットのキーコード
 * @returns 人間が読める文字列（例: "A", "MO(1)", "LCTL(KC_C)"）
 */
export function convertKeycodeToLabel(keycode: number): string {
  // 基本キーコードの場合
  if (BASIC_KEYCODES[keycode]) {
    return BASIC_KEYCODES[keycode];
  }
  
  // レイヤー関連キーコード
  if (keycode >= QK_MOMENTARY && keycode < QK_MOMENTARY + 0x20) {
    const layer = keycode - QK_MOMENTARY;
    return `MO(${layer})`;
  }
  
  if (keycode >= QK_TO && keycode < QK_TO + 0x20) {
    const layer = keycode - QK_TO;
    return `TO(${layer})`;
  }
  
  if (keycode >= QK_DEF_LAYER && keycode < QK_DEF_LAYER + 0x20) {
    const layer = keycode - QK_DEF_LAYER;
    return `DF(${layer})`;
  }
  
  if (keycode >= QK_TOGGLE_LAYER && keycode < QK_TOGGLE_LAYER + 0x20) {
    const layer = keycode - QK_TOGGLE_LAYER;
    return `TG(${layer})`;
  }
  
  if (keycode >= QK_ONE_SHOT_LAYER && keycode < QK_ONE_SHOT_LAYER + 0x20) {
    const layer = keycode - QK_ONE_SHOT_LAYER;
    return `OSL(${layer})`;
  }
  
  if (keycode >= QK_LAYER_TAP_TOGGLE && keycode < QK_LAYER_TAP_TOGGLE + 0x20) {
    const layer = keycode - QK_LAYER_TAP_TOGGLE;
    return `TT(${layer})`;
  }
  
  // Mod-Tap (例: LCTL_T(KC_ESC))
  if (keycode >= QK_MOD_TAP && keycode < QK_MOD_TAP + 0x2000) {
    const mod = (keycode >> 8) & 0x1F;
    const basicKeycode = keycode & 0xFF;
    const modName = getModName(mod);
    const keyName = BASIC_KEYCODES[basicKeycode] || `0x${basicKeycode.toString(16).toUpperCase()}`;
    return `${modName}_T(${keyName})`;
  }
  
  // Layer-Tap (例: LT(1, KC_SPC))
  if (keycode >= QK_LAYER_TAP && keycode < QK_LAYER_TAP + 0x1000) {
    const layer = (keycode >> 8) & 0x0F;
    const basicKeycode = keycode & 0xFF;
    const keyName = BASIC_KEYCODES[basicKeycode] || `0x${basicKeycode.toString(16).toUpperCase()}`;
    return `LT(${layer},${keyName})`;
  }
  
  // Modded keycodes (例: LCTL(KC_C))
  if (keycode >= QK_MODS && keycode < QK_MODS + 0x1F00) {
    const mods = (keycode >> 8) & 0x1F;
    const basicKeycode = keycode & 0xFF;
    const modName = getModName(mods);
    const keyName = BASIC_KEYCODES[basicKeycode] || `0x${basicKeycode.toString(16).toUpperCase()}`;
    return `${modName}(${keyName})`;
  }
  
  // 未知のキーコードは16進数表記
  return `0x${keycode.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * モディファイアビットフラグから文字列に変換
 */
function getModName(modBits: number): string {
  const mods: string[] = [];
  if (modBits & 0x01) mods.push('LCTL');
  if (modBits & 0x02) mods.push('LSFT');
  if (modBits & 0x04) mods.push('LALT');
  if (modBits & 0x08) mods.push('LGUI');
  if (modBits & 0x10) mods.push('RCTL');
  return mods.join('+') || 'MOD';
}
