/**
 * キーボードおよびWebHID関連の型定義
 */

/**
 * 接続されているHIDデバイス
 */
export interface HIDDevice {
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
  deviceHandle: HIDDevice;
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
 * キーマップ取得時のレスポンス
 */
export interface KeymapResponse {
  success: boolean;
  data?: KeymapData;
  error?: string;
}
