import { ref, readonly } from 'vue';
import type { KeyboardDevice, KeymapData } from '../types/keyboard';

/**
 * WebHIDを通じてキーマップを取得するComposable
 */
export function useKeyboardKeymap() {
  const keymapData = ref<KeymapData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const rawHIDData = ref<any>(null);

  /**
   * 選択されたキーボードからキーマップを取得
   */
  async function fetchKeymap(keyboard: KeyboardDevice): Promise<KeymapData | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const hid = (navigator as any).hid;
      if (!hid) {
        throw new Error('WebHID APIが利用できません');
      }

      // デバイスを開く
      const devices = await hid.getDevices();
      const selectedDevice = devices.find(
        (device: any) =>
          device.vendorId === keyboard.vendorId &&
          device.productId === keyboard.productId
      );

      if (!selectedDevice) {
        throw new Error('デバイスが見つかりません');
      }

      // デバイスが閉じられている場合は開く
      if (!selectedDevice.opened) {
        await selectedDevice.open();
      }

      // キーマップを取得（VIA互換コマンド）
      // VIAのキーマップ取得コマンド
      const keymapRawData = await getKeymapViaVIA(selectedDevice);
      rawHIDData.value = keymapRawData;

      // 生データを構造化
      const keymap = parseKeymapData(keymapRawData, keyboard);
      keymapData.value = keymap;

      return keymap;
    } catch (err: any) {
      const errorMsg = err?.message || 'キーマップ取得中にエラーが発生しました';
      error.value = errorMsg;
      console.error('Error fetching keymap:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * VIA互換のコマンドでキーマップを取得
   */
  async function getKeymapViaVIA(device: any): Promise<any> {
    // VIAプロトコルに基づくキーマップ取得
    // レイアウト情報を取得する簡易版

    // デバイス情報を返す（詳細なキーマップはVIAプロトコル実装で取得）
    return {
      vendorId: device.vendorId,
      productId: device.productId,
      productName: device.productName,
      collections: device.collections,
      opened: device.opened,
      // 実装中: HIDレポートでのキーマップ取得
    };
  }

  /**
   * 生データからキーマップを解析
   */
  function parseKeymapData(rawData: any, keyboard: KeyboardDevice): KeymapData {
    // 簡易実装：スケルトンデータを返す
    return {
      keyboard: {
        id: `${keyboard.vendorId}:${keyboard.productId}`,
        name: keyboard.productName,
      },
      layers: {
        0: [],
        1: [],
        2: [],
        3: [],
      },
    };
  }

  /**
   * 取得した生データを表示用に整形
   */
  function getRawDataForDisplay(): string {
    if (!rawHIDData.value) {
      return 'No data';
    }
    return JSON.stringify(rawHIDData.value, null, 2);
  }

  return {
    keymapData: readonly(keymapData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    rawHIDData: readonly(rawHIDData),
    fetchKeymap,
    getRawDataForDisplay,
  };
}
