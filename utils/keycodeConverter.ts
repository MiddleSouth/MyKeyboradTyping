/**
 * QMKキーコードを人間が読める形式に変換するユーティリティ
 * 参考: https://github.com/qmk/qmk_firmware/blob/master/docs/keycodes.md
 */

/** 基本キーコードマップ (0x0004 - 0x00A4) */
const BASIC_KEYCODES: Record<number, string> = {
  0x0000: 'NO',      // KC_NO
  0x0001: '▽',    // KC_TRNS (Transparent)
  
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
  
  // 数字キー 1-0（シフト時の記号も表示）
  0x001E: '!\n1',
  0x001F: '@\n2',
  0x0020: '#\n3',
  0x0021: '$\n4',
  0x0022: '%\n5',
  0x0023: '^\n6',
  0x0024: '&\n7',
  0x0025: '*\n8',
  0x0026: '(\n9',
  0x0027: ')\n0',
  
  // 特殊キー
  0x0028: 'Enter',
  0x0029: 'ESC',
  0x002A: 'Back\nSpace',
  0x002B: 'TAB',
  0x002C: 'Space',
  0x002D: '_\n-',
  0x002E: '+\n=',
  0x002F: '{\n[',
  0x0030: '}\n]',
  0x0031: '|\n\\',
  0x0033: ':\n;',
  0x0034: '"\n\'',
  0x0035: '~\n`',
  0x0036: '<\n,',
  0x0037: '>\n.',
  0x0038: '?\n/',
  0x0039: 'Caps\nlock',

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
  0x0068: 'F13',
  0x0069: 'F14',
  0x006A: 'F15',
  0x006B: 'F16',
  0x006C: 'F17',
  0x006D: 'F18',
  0x006E: 'F19',
  0x006F: 'F20',
  0x0070: 'F21',
  0x0071: 'F22',
  0x0072: 'F23',
  0x0073: 'F24',
  
  // システムキー
  0x0046: 'Print\nScreen',
  0x0047: 'Scroll\nLock',
  0x0048: 'Pause',
  0x0049: 'Insert',
  0x004A: 'Home',
  0x004B: 'Page\nUp',
  0x004C: 'Delete',
  0x004D: 'End',
  0x004E: 'Page\nDown',

  // 矢印キー
  0x004F: '→',
  0x0050: '←',
  0x0051: '↓',
  0x0052: '↑',

  // テンキー
  0x0053: 'Num\nLock',
  0x0054: '/',
  0x0055: '*',
  0x0056: '-',
  0x0057: '+',
  0x0058: 'Enter',
  0x0059: '1',
  0x005A: '2',
  0x005B: '3',
  0x005C: '4',
  0x005D: '5',
  0x005E: '6',
  0x005F: '7',
  0x0060: '8',
  0x0061: '9',
  0x0062: '0',
  0x0063: '.',
  0x0067: '=',

  // アプリケーション・システムキー
  0x0065: 'App',
  0x0066: 'Power',
  0x0074: 'Exec',
  0x0075: 'Help',
  0x0076: 'Menu',
  0x0077: 'Select',
  0x0078: 'Stop',
  0x0079: 'Again',
  0x007A: 'Undo',
  0x007B: 'Cut',
  0x007C: 'Copy',
  0x007D: 'Paste',
  0x007E: 'Find',
  0x007F: 'Mute',
  0x0080: 'Vol\nUp',
  0x0081: 'Vol\nDown',

  // 国際化キー
  0x0087: 'INT1',
  0x0088: 'INT2',
  0x0089: 'INT3',
  0x008A: 'INT4',
  0x008B: 'INT5',
  0x008C: 'INT6',
  0x008D: 'INT7',
  0x008E: 'INT8',
  0x008F: 'INT9',
  0x0090: 'LANG1',
  0x0091: 'LANG2',
  0x0092: 'LANG3',
  0x0093: 'LANG4',
  0x0094: 'LANG5',
  
  // モディファイアキー
  0x00E0: '*Ctrl',
  0x00E1: '*Shift',
  0x00E2: '*Alt',
  0x00E3: '*Win',
  0x00E4: 'Ctrl*',
  0x00E5: 'Shift*',
  0x00E6: 'Alt*',
  0x00E7: 'Win*',
  0x5221: 'Mo(1)',
  0x5222: 'Mo(2)',
  0x5223: 'Mo(3)',

  // マクロキー (0x7700-0x771F)
  0x7700: 'MC0', 0x7701: 'MC1', 0x7702: 'MC2', 0x7703: 'MC3',
  0x7704: 'MC4', 0x7705: 'MC5', 0x7706: 'MC6', 0x7707: 'MC7',
  0x7708: 'MC8', 0x7709: 'MC9', 0x770A: 'MC10', 0x770B: 'MC11',
  0x770C: 'MC12', 0x770D: 'MC13', 0x770E: 'MC14', 0x770F: 'MC15',
  0x7710: 'MC16', 0x7711: 'MC17', 0x7712: 'MC18', 0x7713: 'MC19',
  0x7714: 'MC20', 0x7715: 'MC21', 0x7716: 'MC22', 0x7717: 'MC23',
  0x7718: 'MC24', 0x7719: 'MC25', 0x771A: 'MC26', 0x771B: 'MC27',
  0x771C: 'MC28', 0x771D: 'MC29', 0x771E: 'MC30', 0x771F: 'MC31',

  // バックライト制御 (0x7800-0x7807)
  0x7800: 'BL\nOn',
  0x7801: 'BL\nOff',
  0x7802: 'BL\nTOG',
  0x7803: 'BL\nDOWN',
  0x7804: 'BL\nUP',
  0x7805: 'BL\nSTEP',
  0x7806: 'BL\nBRTH',

  // RGB制御 (0x7820-0x7838)
  0x7820: 'RGB\nTOG',
  0x7821: 'RGB\nMOD',
  0x7822: 'RGB\nRMOD',
  0x7823: 'RGB\nHUI',
  0x7824: 'RGB\nHUD',
  0x7825: 'RGB\nSAI',
  0x7826: 'RGB\nSAD',
  0x7827: 'RGB\nVAI',
  0x7828: 'RGB\nVAD',
  0x7829: 'RGB\nSPI',
  0x782A: 'RGB\nSPD',
  0x782B: 'RGB\nM_P',
  0x782C: 'RGB\nM_B',
  0x782D: 'RGB\nM_R',
  0x782E: 'RGB\nM_SW',
  0x782F: 'RGB\nM_SN',
  0x7830: 'RGB\nM_K',
  0x7831: 'RGB\nM_X',
  0x7832: 'RGB\nM_G',
  0x7833: 'RGB\nM_T',
  0x7834: 'RGB\nM_TW',

  // システム制御 (0x7C00-0x7C10)
  0x7C00: 'Boot',
  0x7C01: 'Reset',
  0x7C02: 'Debug',
  0x7C03: 'EEPROM\nClear',

  // オーディオ (0x7C04-0x7C0B)
  0x7C04: 'AU\nOn',
  0x7C05: 'AU\nOff',
  0x7C06: 'AU\nTOG',
  0x7C07: 'CLCK\nOn',
  0x7C08: 'CLCK\nOff',
  0x7C09: 'CLCK\nTOG',
  0x7C0A: 'MUS\nOn',
  0x7C0B: 'MUS\nOff',
  0x7C0C: 'MUS\nTOG',
  0x7C0D: 'MUS\nMOD',

  // MIDI (選択的に追加)
  0x7100: 'MI\nC',
  0x7101: 'MI\nCs',
  0x7102: 'MI\nD',
  0x7103: 'MI\nDs',
  0x7104: 'MI\nE',
  0x7105: 'MI\nF',
  0x7106: 'MI\nFs',
  0x7107: 'MI\nG',
  0x7108: 'MI\nGs',
  0x7109: 'MI\nA',
  0x710A: 'MI\nAs',
  0x710B: 'MI\nB',
  
  // Unicode Mode (0x7C30-0x7C3A)
  0x7C30: 'UC\nNext',
  0x7C31: 'UC\nPrev',
  0x7C32: 'UC\nMac',
  0x7C33: 'UC\nLinx',
  0x7C34: 'UC\nWin',
  0x7C35: 'UC\nBSD',
  0x7C36: 'UC\nWinc',
  0x7C37: 'UC\nEmcs',

  // Dynamic Macro (0x7C50-0x7C57)
  0x7C50: 'DM\nREC1',
  0x7C51: 'DM\nREC2',
  0x7C52: 'DM\nRSTR',
  0x7C53: 'DM\nPLY1',
  0x7C54: 'DM\nPLY2',

  // その他のQuantum keycodes
  0x7C58: 'Leader',
  0x7C59: 'Lock',
  0x7C5A: 'OS\nOn',
  0x7C5B: 'OS\nOff',
  0x7C5C: 'OS\nTOG',
  0x7C70: 'Auto\nShft',
  0x7C78: 'Repeat',
  0x7C79: 'AltRep',

  // メディアキー (Consumer Page)
  0xA0: 'Mute',
  0xA1: 'Vol\nUp',
  0xA2: 'Vol\nDown',
  0xA3: 'Next',
  0xA4: 'Prev',
  0xA5: 'Stop',
  0xA6: 'Play',
  0xA7: 'Eject',
  0xA8: 'Mail',
  0xA9: 'Calc',
  0xAA: 'My\nPC',
  0xAB: 'WWW\nSrch',
  0xAC: 'WWW\nHome',
  0xAD: 'WWW\nBack',
  0xAE: 'WWW\nFwd',
  0xAF: 'WWW\nStop',
  0xB0: 'WWW\nRfsh',
  0xB1: 'WWW\nFav',
  0xB2: 'Media\nFF',
  0xB3: 'Media\nRew',
  0xB5: 'Bright\nUp',
  0xB6: 'Bright\nDown',

  // マウスキー
  0xF0: 'Mouse\nUp',
  0xF1: 'Mouse\nDown',
  0xF2: 'Mouse\nLeft',
  0xF3: 'Mouse\nRight',
  0xF4: 'Btn1',
  0xF5: 'Btn2',
  0xF6: 'Btn3',
  0xF7: 'Btn4',
  0xF8: 'Btn5',
  0xF9: 'Btn6',
  0xFA: 'Btn7',
  0xFB: 'Btn8',
  0xFC: 'Wheel\nUp',
  0xFD: 'Wheel\nDown',
  0xFE: 'Wheel\nLeft',
  0xFF: 'Wheel\nRight',
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
 * キー名を短縮（組み合わせ表示用）
 * 現在はBackSpaceのみ短縮、他はそのまま
 */
function shortenKeyName(keyName: string): string {
  // BackSpaceのみ短縮（改行を削除してBSpcに）
  if (keyName === 'Back\nSpace') {
    return 'BSpc';
  }
  return keyName;
}

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
  
  // One-Shot Mod (例: OSM(MOD_LSFT))
  if (keycode >= QK_ONE_SHOT_MOD && keycode < QK_ONE_SHOT_MOD + 0x80) {
    const mod = keycode - QK_ONE_SHOT_MOD;
    const modName = getModName(mod);
    // 複数のモディファイアの場合、+で分割して改行区切りに
    const mods = modName.split('+');
    return ['OSM', ...mods].join('\n');
  }
  
  if (keycode >= QK_LAYER_TAP_TOGGLE && keycode < QK_LAYER_TAP_TOGGLE + 0x20) {
    const layer = keycode - QK_LAYER_TAP_TOGGLE;
    return `TT(${layer})`;
  }
  
  // Programmable Button (0x7440-0x745F)
  if (keycode >= 0x7440 && keycode <= 0x745F) {
    const buttonNum = keycode - 0x7440 + 1;
    return `PB${buttonNum}`;
  }
  
  // Joystick Button (0x7400-0x741F)
  if (keycode >= 0x7400 && keycode <= 0x741F) {
    const buttonNum = keycode - 0x7400;
    return `JS${buttonNum}`;
  }
  
  // Mod-Tap (例: LCTL_T(KC_ESC))
  if (keycode >= QK_MOD_TAP && keycode < QK_MOD_TAP + 0x2000) {
    const mod = (keycode >> 8) & 0x1F;
    const basicKeycode = keycode & 0xFF;
    const modName = getModName(mod);
    const keyName = BASIC_KEYCODES[basicKeycode] || `0x${basicKeycode.toString(16).toUpperCase()}`;
    const shortKeyName = shortenKeyName(keyName);
    // 複数のモディファイアの場合、+で分割
    const mods = modName.split('+');
    const modParts = mods.map(m => `${m}_T`);
    return [...modParts, shortKeyName].join('\n');
  }
  
  // Layer-Tap (例: LT(1, KC_SPC))
  if (keycode >= QK_LAYER_TAP && keycode < QK_LAYER_TAP + 0x1000) {
    const layer = (keycode >> 8) & 0x0F;
    const basicKeycode = keycode & 0xFF;
    const keyName = BASIC_KEYCODES[basicKeycode] || `0x${basicKeycode.toString(16).toUpperCase()}`;
    const shortKeyName = shortenKeyName(keyName);
    return `LT${layer}\n${shortKeyName}`;
  }
  
  // Modded keycodes (例: LCTL(KC_C))
  if (keycode >= QK_MODS && keycode < QK_MODS + 0x1F00) {
    const mods = (keycode >> 8) & 0x1F;
    const basicKeycode = keycode & 0xFF;
    const modName = getModName(mods);
    const keyName = BASIC_KEYCODES[basicKeycode] || `0x${basicKeycode.toString(16).toUpperCase()}`;
    const shortKeyName = shortenKeyName(keyName);
    // 複数のモディファイアの場合、+で分割して改行区切りに
    const modParts = modName.split('+');
    return [...modParts, shortKeyName].join('\n');
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
