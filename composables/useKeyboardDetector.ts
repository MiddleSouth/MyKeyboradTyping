import { ref, readonly } from 'vue';
import type { KeyboardDevice, HIDDevice } from '../types/keyboard';

/**
 * WebHID APIを使用してキーボードを検出するComposable
 */
export function useKeyboardDetector() {
  const keyboards = ref<KeyboardDevice[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

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
      
      if (devices.length === 0) {
        keyboards.value = [];
        return [];
      }

      // HIDデバイスをキーボードとして解釈
      const detectedKeyboards: KeyboardDevice[] = devices.map((device: any) => {
        // collections から情報を取得
        const inputCollection = device.collections[0];
        const usagePage = inputCollection?.usagePage;
        const usage = inputCollection?.usage;

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

      keyboards.value = detectedKeyboards;
      return detectedKeyboards;
    } catch (err: any) {
      const errorMsg = err?.message || 'キーボード検出中にエラーが発生しました';
      error.value = errorMsg;
      keyboards.value = [];
      console.error('Error detecting keyboards:', err);
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
      const devices = await hid.requestDevice({ filters: [] });

      if (devices.length === 0) {
        return null;
      }

      const device = devices[0];

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

      return selectedKeyboard;
    } catch (err: any) {
      console.error('Error requesting keyboard:', err);
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
