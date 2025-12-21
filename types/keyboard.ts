/**
 * キーボードおよびWebHID関連の型定義
 */

/**
 * キーボードデバイスハンドル（簡易情報）
 */
export interface KeyboardDeviceHandle {
  vendorId: number;
  productId: number;
  productName: string;
  opened: boolean;
}

/**
 * 検出されたキーボードデバイス
 */
export interface KeyboardDevice {
  vendorId: number;
  productId: number;
  productName: string;
  deviceHandle: KeyboardDeviceHandle;
  isConnected: boolean;
}

/**
 * キーマップデータ（Remapから取得）
 */
export interface KeymapData {
  keyboard: {
    id: string;
    name: string;
  };
  layers: {
    readonly [layerNumber: number]: readonly (readonly number[])[];  // [row][col] = キーコード
  };
}

/**
 * VIA経由で取得した生のキーマップデータ
 */
export interface RawKeymapData {
  vendorId: number;
  productId: number;
  productName: string;
  rows: number;
  cols: number;
  layerCount: number;
  keymap_by_layer: {
    readonly [layerNumber: number]: readonly (readonly number[])[];  // [row][col] = キーコード
  };
  timestamp: string;
}

/**
 * キーボードレイアウト上の1つのキーの物理的位置情報（QMK形式）
 */
export interface KeyPosition {
  /** マトリックス位置 [row, col] */
  matrix: [number, number];
  /** X座標（キー単位、1u = 1キー幅） */
  x: number;
  /** Y座標（キー単位、1u = 1キー高さ） */
  y: number;
  /** キー幅（省略時は1u） */
  w?: number;
  /** キー高さ（省略時は1u） */
  h?: number;
  /** 回転角度（度数法） */
  r?: number;
  /** 回転の中心X座標 */
  rx?: number;
  /** 回転の中心Y座標 */
  ry?: number;
}

/**
 * キーボードの物理レイアウト定義
 */
export interface KeyboardLayout {
  /** レイアウトマクロ名（例: "LAYOUT", "LAYOUT_split_3x6_3"） */
  name: string;
  /** 各キーの物理的位置情報の配列 */
  layout: KeyPosition[];
}
