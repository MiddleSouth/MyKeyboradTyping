import { createLogger } from './useLogger';

const logger = createLogger('KeyInput');

/**
 * 物理キーコードからQMKキーコードへのマッピング
 * HID Usage Table準拠
 */
export const PHYSICAL_KEY_TO_QMK: Record<string, number> = {
  // 文字キー A-Z
  'KeyA': 0x0004,
  'KeyB': 0x0005,
  'KeyC': 0x0006,
  'KeyD': 0x0007,
  'KeyE': 0x0008,
  'KeyF': 0x0009,
  'KeyG': 0x000A,
  'KeyH': 0x000B,
  'KeyI': 0x000C,
  'KeyJ': 0x000D,
  'KeyK': 0x000E,
  'KeyL': 0x000F,
  'KeyM': 0x0010,
  'KeyN': 0x0011,
  'KeyO': 0x0012,
  'KeyP': 0x0013,
  'KeyQ': 0x0014,
  'KeyR': 0x0015,
  'KeyS': 0x0016,
  'KeyT': 0x0017,
  'KeyU': 0x0018,
  'KeyV': 0x0019,
  'KeyW': 0x001A,
  'KeyX': 0x001B,
  'KeyY': 0x001C,
  'KeyZ': 0x001D,
  
  // 数字キー 1-0
  'Digit1': 0x001E,
  'Digit2': 0x001F,
  'Digit3': 0x0020,
  'Digit4': 0x0021,
  'Digit5': 0x0022,
  'Digit6': 0x0023,
  'Digit7': 0x0024,
  'Digit8': 0x0025,
  'Digit9': 0x0026,
  'Digit0': 0x0027,
  
  // 特殊キー
  'Enter': 0x0028,
  'Escape': 0x0029,
  'Backspace': 0x002A,
  'Tab': 0x002B,
  'Space': 0x002C,
  'Minus': 0x002D,
  'Equal': 0x002E,
  'BracketLeft': 0x002F,
  'BracketRight': 0x0030,
  'Backslash': 0x0031,
  'Semicolon': 0x0033,
  'Quote': 0x0034,
  'Backquote': 0x0035,
  'Comma': 0x0036,
  'Period': 0x0037,
  'Slash': 0x0038,
  'CapsLock': 0x0039,
  
  // ファンクションキー
  'F1': 0x003A,
  'F2': 0x003B,
  'F3': 0x003C,
  'F4': 0x003D,
  'F5': 0x003E,
  'F6': 0x003F,
  'F7': 0x0040,
  'F8': 0x0041,
  'F9': 0x0042,
  'F10': 0x0043,
  'F11': 0x0044,
  'F12': 0x0045,
  
  // システムキー
  'PrintScreen': 0x0046,
  'ScrollLock': 0x0047,
  'Pause': 0x0048,
  'Insert': 0x0049,
  'Home': 0x004A,
  'PageUp': 0x004B,
  'Delete': 0x004C,
  'End': 0x004D,
  'PageDown': 0x004E,
  
  // 矢印キー
  'ArrowRight': 0x004F,
  'ArrowLeft': 0x0050,
  'ArrowDown': 0x0051,
  'ArrowUp': 0x0052,
  
  // テンキー
  'NumLock': 0x0053,
  'NumpadDivide': 0x0054,
  'NumpadMultiply': 0x0055,
  'NumpadSubtract': 0x0056,
  'NumpadAdd': 0x0057,
  'NumpadEnter': 0x0058,
  'Numpad1': 0x0059,
  'Numpad2': 0x005A,
  'Numpad3': 0x005B,
  'Numpad4': 0x005C,
  'Numpad5': 0x005D,
  'Numpad6': 0x005E,
  'Numpad7': 0x005F,
  'Numpad8': 0x0060,
  'Numpad9': 0x0061,
  'Numpad0': 0x0062,
  'NumpadDecimal': 0x0063,
  
  // モディファイアキー
  'ControlLeft': 0x00E0,
  'ShiftLeft': 0x00E1,
  'AltLeft': 0x00E2,
  'MetaLeft': 0x00E3,
  'ControlRight': 0x00E4,
  'ShiftRight': 0x00E5,
  'AltRight': 0x00E6,
  'MetaRight': 0x00E7,
};

/**
 * キー入力イベント情報
 */
export interface KeyInputEvent {
  code: string;           // 物理キーコード（例: "KeyA"）
  key: string;            // キーの値（例: "a", "A"）
  qmkKeycode: number;     // QMKキーコード（例: 0x0004）
  originalEvent: KeyboardEvent;
}

/**
 * 物理キーボード入力を検出し、QMKキーコードに変換するComposable
 */
export function useKeyInput() {
  /**
   * 物理キーコードをQMKキーコードに変換
   */
  function convertToQMKKeycode(code: string): number | null {
    return PHYSICAL_KEY_TO_QMK[code] ?? null;
  }

  /**
   * KeyDownイベントを処理してキー入力情報に変換
   */
  function handleKeyDown(event: KeyboardEvent): KeyInputEvent | null {
    const code = event.code;
    const qmkKeycode = convertToQMKKeycode(code);
    
    logger.debug('[KeyDown]', {
      code,
      key: event.key,
      qmkKeycode: qmkKeycode ? `0x${qmkKeycode.toString(16).toUpperCase().padStart(4, '0')}` : 'not mapped'
    });
    
    if (!qmkKeycode) {
      logger.debug(`  ⚠ Key "${code}" is not mapped to QMK keycode`);
      return null;
    }
    
    return {
      code,
      key: event.key,
      qmkKeycode,
      originalEvent: event,
    };
  }

  /**
   * KeyUpイベントを処理してキー入力情報に変換
   */
  function handleKeyUp(event: KeyboardEvent): KeyInputEvent | null {
    const code = event.code;
    const qmkKeycode = convertToQMKKeycode(code);
    
    logger.debug('[KeyUp]', {
      code,
      key: event.key,
      qmkKeycode: qmkKeycode ? `0x${qmkKeycode.toString(16).toUpperCase().padStart(4, '0')}` : 'not mapped'
    });
    
    if (!qmkKeycode) {
      return null;
    }
    
    return {
      code,
      key: event.key,
      qmkKeycode,
      originalEvent: event,
    };
  }

  return {
    convertToQMKKeycode,
    handleKeyDown,
    handleKeyUp,
  };
}
