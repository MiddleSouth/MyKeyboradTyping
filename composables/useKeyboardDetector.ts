import { ref, readonly } from 'vue';
import type { KeyboardDevice, HIDDevice } from '../types/keyboard';

// キーボードのUSAGE PAGE と USAGE
const KEYBOARD_USAGE_PAGE = 0x01;  // Generic Desktop
const KEYBOARD_USAGE = 0x06;        // Keyboard

/**
 * WebHID APIを使用してキーボードを検出するComposable
 */
export function useKeyboardDetector() {
  const keyboards = ref<KeyboardDevice[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * デバイスがキーボードであるかを判定
   */
  function isKeyboardDevice(device: any): boolean {
    // collections を確認してキーボードかどうかを判定
    if (!device.collections || device.collections.length === 0) {
      return false;
    }

    // キーボードの場合、usagePageが0x01, usageが0x06
    for (const collection of device.collections) {
      if (collection.usagePage === KEYBOARD_USAGE_PAGE && collection.usage === KEYBOARD_USAGE) {
        return true;
      }
    }

    return false;
  }

  /**
   * デバイスリストから重複を削除
   */
  function deduplicateDevices(devices: KeyboardDevice[]): KeyboardDevice[] {
    const seen = new Set<string>();
    const result: KeyboardDevice[] = [];

    for (const device of devices) {
      const key = `${device.vendorId}:${device.productId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(device);
      }
    }

    return result;
  }

  /**
   * システムに接続されているキーボードを検出
   */
  async function detectKeyboards(): Promise<KeyboardDevice[]> {
    // WebHID APIのサポート確認
    const hid = (navigator as any).hid;
    if (!hid) {
      error.value = 'このブラウザはWebHID APIに対応していません。Chrome/Edgeを使用してください。';
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      // 既に許可されているデバイスを取得
      const devices = await hid.getDevices();
      
      console.log('[useKeyboardDetector] 検出されたデバイス数:', devices.length);
      devices.forEach((device: any, index: number) => {
        console.log(`[useKeyboardDetector] Device ${index}:`, {
          vendorId: `0x${device.vendorId.toString(16).toUpperCase().padStart(4, '0')}`,
          productId: `0x${device.productId.toString(16).toUpperCase().padStart(4, '0')}`,
          productName: device.productName,
          opened: device.opened,
          collections: device.collections?.length || 0,
        });
      });
      
      if (devices.length === 0) {
        console.log('[useKeyboardDetector] デバイスが見つかりません。');
        keyboards.value = [];
        return [];
      }

      // キーボードのみをフィルタリング
      const keyboardDevices = devices.filter((device: any) => isKeyboardDevice(device));
      
      console.log('[useKeyboardDetector] キーボードデバイス数:', keyboardDevices.length);

      const detectedKeyboards: KeyboardDevice[] = keyboardDevices.map((device: any) => {
        return {
          vendorId: device.vendorId,
          productId: device.productId,
          productName: device.productName || `Unknown Device (${device.vendorId}:${device.productId})`,
          deviceHandle: {
            vendorId: device.vendorId,
            productId: device.productId,
            productName: device.productName || `Unknown Device`,
            opened: device.opened,
          },
          isConnected: device.opened,
        };
      });

      // 重複を削除
      const uniqueKeyboards = deduplicateDevices(detectedKeyboards);

      console.log('[useKeyboardDetector] 変換後のキーボード数:', uniqueKeyboards.length);
      keyboards.value = uniqueKeyboards;
      return uniqueKeyboards;
    } catch (err: any) {
      const errorMsg = err?.message || 'キーボード検出中にエラーが発生しました';
      error.value = errorMsg;
      keyboards.value = [];
      console.error('[useKeyboardDetector] Error detecting keyboards:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ユーザーに新しいキーボードを選択させる
   */
  async function requestKeyboardSelection(): Promise<KeyboardDevice | null> {
    const hid = (navigator as any).hid;
    if (!hid) {
      error.value = 'このブラウザはWebHID APIに対応していません。';
      return null;
    }

    try {
      console.log('[useKeyboardDetector] ユーザーにキーボード選択ダイアログを表示');
      // キーボードのみをフィルタ
      const devices = await hid.requestDevice({ 
        filters: [
          { usagePage: KEYBOARD_USAGE_PAGE, usage: KEYBOARD_USAGE }
        ]
      });

      if (devices.length === 0) {
        console.log('[useKeyboardDetector] ユーザーがデバイス選択をキャンセル');
        return null;
      }

      const device = devices[0];
      console.log('[useKeyboardDetector] 選択されたデバイス:', {
        vendorId: `0x${device.vendorId.toString(16).toUpperCase().padStart(4, '0')}`,
        productId: `0x${device.productId.toString(16).toUpperCase().padStart(4, '0')}`,
        productName: device.productName,
      });

      const selectedKeyboard: KeyboardDevice = {
        vendorId: device.vendorId,
        productId: device.productId,
        productName: device.productName || `Unknown Device (${device.vendorId}:${device.productId})`,
        deviceHandle: {
          vendorId: device.vendorId,
          productId: device.productId,
          productName: device.productName || `Unknown Device`,
          opened: device.opened,
        },
        isConnected: device.opened,
      };

      // 既に存在するかチェック
      const isDuplicate = keyboards.value.some(
        (kb) => kb.vendorId === device.vendorId && kb.productId === device.productId
      );

      // リストに追加（重複していない場合）
      if (!isDuplicate) {
        keyboards.value.push(selectedKeyboard);
      }

      return selectedKeyboard;
    } catch (err: any) {
      console.error('[useKeyboardDetector] Error requesting keyboard:', err);
      if (err.name !== 'NotAllowedError') {
        error.value = 'キーボード選択中にエラーが発生しました';
      }
      return null;
    }
  }

  return {
    keyboards: readonly(keyboards),
    isLoading: readonly(isLoading),
    error: readonly(error),
    detectKeyboards,
    requestKeyboardSelection,
  };
}
