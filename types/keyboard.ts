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
    [layerNumber: number]: number[][];  // [row][col] = キーコード
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
    [layerNumber: number]: number[][];  // [row][col] = キーコード
  };
  timestamp: string;
}
