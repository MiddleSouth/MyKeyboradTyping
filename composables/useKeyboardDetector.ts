import { ref, readonly } from 'vue';
import type { KeyboardDevice, HIDDevice } from '../types/keyboard';
import { useKeyboardState } from './useKeyboardState';

// VIA対応デバイスのUSAGE PAGE と USAGE (Remapと同じ)
const VIA_USAGE_PAGE = 0xff60;  // VIA Raw HID
const VIA_USAGE = 0x61;          // VIA Protocol

/**
 * WebHID APIを使用してキーボードを検出するComposable
 */
export function useKeyboardDetector() {
  const { setError, setSelectedKeyboard } = useKeyboardState();
  const keyboards = ref<KeyboardDevice[]>([]);
  const isLoading = ref(false);

  /**
   * デバイスがVIA対応キーボードであるかを判定
   * VIA専用コレクションまたは通常のキーボードコレクションを持つデバイスを検出
   */
  function isVIASupportedDevice(device: any): boolean {
    // collections を確認してVIA対応かどうかを判定
    if (!device.collections || device.collections.length === 0) {
      return false;
    }

    // 優先順位1: VIA専用コレクション (usagePage: 0xff60, usage: 0x61)
    for (const collection of device.collections) {
      if (collection.usagePage === VIA_USAGE_PAGE && collection.usage === VIA_USAGE) {
        console.log('[useKeyboardDetector] VIA専用コレクション発見:', device.productName);
        return true;
      }
    }

    // 優先順位2: 通常のキーボードコレクション (usagePage: 0x01, usage: 0x06)
    // QMKのVIAサポートは通常のキーボードエンドポイント経由でも動作する
    for (const collection of device.collections) {
      if (collection.usagePage === 0x01 && collection.usage === 0x06) {
        console.log('[useKeyboardDetector] 通常のキーボードコレクション発見（VIA互換の可能性あり）:', device.productName);
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
      setError('このブラウザはWebHID APIに対応していません。Chrome/Edgeを使用してください。');
      return [];
    }

    isLoading.value = true;

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

      // VIA対応キーボードのみをフィルタリング
      const keyboardDevices = devices.filter((device: any) => isVIASupportedDevice(device));
      
      console.log('[useKeyboardDetector] VIA対応キーボードデバイス数:', keyboardDevices.length);

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

      // デバイスを開く（許可がある場合）
      for (const device of keyboardDevices) {
        try {
          if (!device.opened) {
            await device.open();
            console.log(`[useKeyboardDetector] デバイスを開きました: ${device.productName}`);
          }
        } catch (err) {
          console.error(`[useKeyboardDetector] デバイスオープンエラー:`, err);
        }
      }

      // デバイス情報を再取得（opened状態を更新）
      const detectedKeyboards2: KeyboardDevice[] = keyboardDevices.map((device: any) => {
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
      const uniqueKeyboards = deduplicateDevices(detectedKeyboards2);

      console.log('[useKeyboardDetector] 変換後のキーボード数:', uniqueKeyboards.length);
      keyboards.value = uniqueKeyboards;
      return uniqueKeyboards;
    } catch (err: any) {
      const errorMsg = err?.message || 'キーボード検出中にエラーが発生しました';
      setError(errorMsg);
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
      setError('このブラウザはWebHID APIに対応していません。');
      return null;
    }

    try {
      console.log('[useKeyboardDetector] ユーザーにVIA対応キーボード選択ダイアログを表示');
      // VIA対応キーボードまたは通常のキーボードをフィルタ
      const devices = await hid.requestDevice({ 
        filters: [
          { usagePage: VIA_USAGE_PAGE, usage: VIA_USAGE },      // VIA専用コレクション
          { usagePage: 0x01, usage: 0x06 }                      // 通常のキーボードコレクション
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

      // グローバル状態に選択されたキーボードを設定
      setSelectedKeyboard(selectedKeyboard);

      return selectedKeyboard;
    } catch (err: any) {
      console.error('[useKeyboardDetector] Error requesting keyboard:', err);
      if (err.name !== 'NotAllowedError') {
        setError('キーボード選択中にエラーが発生しました');
      }
      return null;
    }
  }

  return {
    keyboards: readonly(keyboards),
    isLoading: readonly(isLoading),
    detectKeyboards,
    requestKeyboardSelection,
  };
}
