import { ref, readonly } from 'vue';
import type { KeyboardDevice, KeymapData } from '../types/keyboard';
import { useKeyboardState } from './useKeyboardState';

// VIA プロトコルの定義 (Remapと同じ)
const VIA_USAGE_PAGE = 0xff60;
const VIA_USAGE = 0x61;

// VIA Command IDs (Remap の Commands.ts に基づく)
const id_get_protocol_version = 0x01;
const id_get_keyboard_value = 0x02;
const id_dynamic_keymap_get_layer_count = 0x11;
const id_dynamic_keymap_get_buffer = 0x12;

// Keyboard value IDs
const id_uptime = 0x01;
const id_layout_options = 0x02;
const id_switch_matrix_state = 0x03;

/**
 * WebHIDを通じてキーマップを取得するComposable
 */
export function useKeyboardKeymap() {
  const { setError } = useKeyboardState();
  const keymapData = ref<KeymapData | null>(null);
  const isLoading = ref(false);
  const rawHIDData = ref<any>(null);

  /**
   * 選択されたキーボードからキーマップを取得
   */
  async function fetchKeymap(keyboard: KeyboardDevice): Promise<KeymapData | null> {
    isLoading.value = true;

    try {
      const hid = (navigator as any).hid;
      if (!hid) {
        throw new Error('WebHID APIが利用できません');
      }

      // すべてのHIDデバイスを取得（同じ物理デバイスが複数のインターフェースとして現れる）
      const devices = await hid.getDevices();
      console.log('[useKeyboardKeymap] すべてのHIDデバイス:');
      devices.forEach((device: any, index: number) => {
        console.log(`  デバイス ${index}:`, {
          productName: device.productName,
          vendorId: `0x${device.vendorId.toString(16).padStart(4, '0')}`,
          productId: `0x${device.productId.toString(16).padStart(4, '0')}`,
          opened: device.opened,
          collections: device.collections?.length || 0,
        });
        if (device.collections) {
          device.collections.forEach((collection: any, colIndex: number) => {
            console.log(`    コレクション ${colIndex}:`, {
              usagePage: `0x${collection.usagePage?.toString(16).padStart(4, '0')}`,
              usage: `0x${collection.usage?.toString(16).padStart(2, '0')}`,
              outputReports: collection.outputReports?.length || 0,
              inputReports: collection.inputReports?.length || 0,
            });
          });
        }
      });

      // 同じvendorId/productIdを持つすべてのデバイスを取得
      const matchingDevices = devices.filter(
        (device: any) =>
          device.vendorId === keyboard.vendorId &&
          device.productId === keyboard.productId
      );

      if (matchingDevices.length === 0) {
        throw new Error('デバイスが見つかりません');
      }

      console.log('[useKeyboardKeymap] マッチするデバイス数:', matchingDevices.length);

      // VIA対応のコレクションを持つデバイスを優先的に選択
      let selectedDevice = matchingDevices.find((device: any) =>
        device.collections?.some((c: any) => 
          c.usagePage === VIA_USAGE_PAGE && c.usage === VIA_USAGE
        )
      );

      // VIA対応デバイスがなければ、outputReportsを持つデバイスを選択
      if (!selectedDevice) {
        selectedDevice = matchingDevices.find((device: any) =>
          device.collections?.some((c: any) => 
            c.outputReports && c.outputReports.length > 0
          )
        );
      }

      // それでもなければ最初のデバイスを使用
      if (!selectedDevice) {
        selectedDevice = matchingDevices[0];
      }

      console.log('[useKeyboardKeymap] 選択されたデバイス:', {
        productName: selectedDevice.productName,
        collections: selectedDevice.collections?.length,
      });

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
      setError(errorMsg);
      console.error('Error fetching keymap:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * VIA互換のコマンドでキーマップを取得
   * 
   * Remapのキーマップ取得フローに基づく実装
   */
  async function getKeymapViaVIA(device: any): Promise<any> {
    try {
      console.log('[useKeyboardKeymap] VIA プロトコルでキーマップ取得を開始');
      console.log('[useKeyboardKeymap] デバイス情報:', {
        productName: device.productName,
        opened: device.opened,
        collections: device.collections?.length || 0,
      });

      // デバッグ: すべてのコレクション情報を出力
      console.log('[useKeyboardKeymap] すべてのコレクション情報:');
      if (device.collections) {
        device.collections.forEach((collection: any, index: number) => {
          console.log(`  コレクション ${index}:`, {
            usagePage: `0x${collection.usagePage?.toString(16).padStart(4, '0')}`,
            usage: `0x${collection.usage?.toString(16).padStart(2, '0')}`,
            inputReports: collection.inputReports?.length || 0,
            outputReports: collection.outputReports?.length || 0,
            featureReports: collection.featureReports?.length || 0,
          });
        });
      }

      // VIA対応のコレクションを探す（優先）
      let targetCollection = device.collections?.find(
        (c: any) => c.usagePage === VIA_USAGE_PAGE && c.usage === VIA_USAGE
      );

      if (targetCollection) {
        console.log('[useKeyboardKeymap] VIA専用コレクション発見:', targetCollection);
      } else {
        // VIAコレクションがない場合は、通常のキーボードコレクションを使用
        // QMKのVIAサポートは通常のキーボードエンドポイント経由でも動作する
        targetCollection = device.collections?.find(
          (c: any) => c.usagePage === 0x01 && c.usage === 0x06
        );
        
        if (targetCollection) {
          console.log('[useKeyboardKeymap] 通常のキーボードコレクションを使用（VIAコマンドは送信可能）:', targetCollection);
        } else {
          console.error('[useKeyboardKeymap] 使用可能なコレクションが見つかりません');
          throw new Error('キーボードコレクションが見つかりません。');
        }
      }

      // ReportID を特定（通常は0）
      let reportId = 0;
      if (targetCollection.outputReports && targetCollection.outputReports.length > 0) {
        reportId = targetCollection.outputReports[0].reportId || 0;
        console.log('[useKeyboardKeymap] reportId:', reportId);
      } else {
        console.log('[useKeyboardKeymap] outputReports未定義、reportId=0を使用');
      }

      // 入力リスナーを設定（レスポンス待機用）
      const responsePromises = new Map<string, Promise<Uint8Array>>();
      const createResponsePromise = (key: string) => {
        const promise = new Promise<Uint8Array>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`レスポンスタイムアウト: ${key}`));
          }, 5000);  // 5秒に延長（Remapでは長めに設定）

          const listener = (event: any) => {
            const data = event.data as DataView;
            const buffer = new Uint8Array(data.buffer);
            
            console.log(`[useKeyboardKeymap] レスポンス受信 (${key}):`, Array.from(buffer.slice(0, 10)));
            
            clearTimeout(timeout);
            device.removeEventListener('inputreport', listener);
            resolve(buffer);
          };

          device.addEventListener('inputreport', listener);
        });
        responsePromises.set(key, promise);
        return promise;
      };

      // 1. プロトコルバージョンを確認
      console.log('[useKeyboardKeymap] ステップ 1: プロトコルバージョン確認');
      const versionResponsePromise = createResponsePromise('version');
      await sendVIACommand(device, [id_get_protocol_version], reportId);
      
      let viaProtocolVersion = 0x0c; // デフォルト値
      try {
        const versionBuffer = await versionResponsePromise;
        viaProtocolVersion = (versionBuffer[1] << 8) | versionBuffer[2];
        console.log('[useKeyboardKeymap] プロトコルバージョン:', `0x${viaProtocolVersion.toString(16).padStart(4, '0')}`);
        
        // Remapと同じく、0x0C未満は非対応
        if (viaProtocolVersion < 0x0c) {
          throw new Error(`VIAプロトコルバージョン ${viaProtocolVersion} は対応していません。0x0C以上が必要です。`);
        }
      } catch (err) {
        console.warn('[useKeyboardKeymap] プロトコルバージョン取得エラー:', err);
        throw err;
      }

      // 2. レイヤー数を取得
      console.log('[useKeyboardKeymap] ステップ 2: レイヤー数取得');
      const layerCountResponsePromise = createResponsePromise('layerCount');
      await sendVIACommand(device, [id_dynamic_keymap_get_layer_count], reportId);
      
      let layerCount = 4; // デフォルト値
      try {
        const layerCountBuffer = await layerCountResponsePromise;
        layerCount = layerCountBuffer[1];
        console.log('[useKeyboardKeymap] レイヤー数:', layerCount);
      } catch (err) {
        console.warn('[useKeyboardKeymap] レイヤー数取得エラー、デフォルト値を使用:', layerCount, err);
      }

      // 3. マトリクスサイズ（固定値を使用）
      // TODO: 将来的にはキーボード定義JSONから取得すべき
      const rows = 5;
      const cols = 14;
      console.log('[useKeyboardKeymap] マトリクスサイズ（固定値）: rows=', rows, 'cols=', cols);

      // 4. キーマップデータを取得（Remapと同じバッファ読み込み方式）
      const keymapByLayer: any = {};
      for (let layer = 0; layer < layerCount; layer++) {
        console.log(`[useKeyboardKeymap] ステップ ${3 + layer}: レイヤー ${layer} のキーマップ取得`);
        
        // Remapと同じく、バッファを28バイトずつ読み込む
        const totalSize = rows * cols * 2; // 各キーは2バイト
        let offset = layer * totalSize;
        const keymapData: number[] = [];
        
        let remainingSize = totalSize;
        while (remainingSize > 0) {
          const size = Math.min(28, remainingSize);
          
          const bufferResponsePromise = createResponsePromise(`buffer-${layer}-${offset}`);
          await sendVIACommand(device, [
            id_dynamic_keymap_get_buffer,
            (offset >> 8) & 0xff,  // offset high byte
            offset & 0xff,          // offset low byte
            size                     // size
          ], reportId);
          
          try {
            const bufferData = await bufferResponsePromise;
            // レスポンスの4バイト目からがデータ本体
            for (let i = 4; i < 4 + size; i++) {
              keymapData.push(bufferData[i]);
            }
            console.log(`[useKeyboardKeymap] バッファ読み込み: offset=${offset}, size=${size}, 取得=${size}バイト`);
          } catch (err) {
            console.warn(`[useKeyboardKeymap] バッファ読み込みエラー: offset=${offset}`, err);
            // タイムアウトの場合は0で埋める
            for (let i = 0; i < size; i++) {
              keymapData.push(0);
            }
          }
          
          offset += size;
          remainingSize -= size;
        }
        
        // バイト配列をキーマップに変換
        const layerKeymap: any[][] = [];
        let dataIndex = 0;
        for (let row = 0; row < rows; row++) {
          layerKeymap[row] = [];
          for (let col = 0; col < cols; col++) {
            const keycode = (keymapData[dataIndex] << 8) | keymapData[dataIndex + 1];
            layerKeymap[row][col] = keycode;
            dataIndex += 2;
          }
        }
        
        keymapByLayer[layer] = layerKeymap;
      }

      // 結果をまとめる
      const result = {
        vendorId: device.vendorId,
        productId: device.productId,
        productName: device.productName,
        rows,
        cols,
        layerCount,
        keymap_by_layer: keymapByLayer,
        timestamp: new Date().toISOString(),
      };

      console.log('[useKeyboardKeymap] キーマップ取得完了:', result);
      return result;
    } catch (err: any) {
      console.error('[useKeyboardKeymap] VIA キーマップ取得エラー:', err);
      throw err;
    }
  }

  /**
   * VIA コマンドを送信
   * 
   * Remapの実装パターンに合わせ、通常出力レポート（sendReport）を使用
   * WebHID仕様:
   * - sendReport(reportId: octet, data: BufferSource)
   * 
   * 注意: レスポンス取得は inputreport イベントリスナーで行う
   */
  async function sendVIACommand(device: any, command: number[], reportId: number = 0): Promise<any> {
    try {
      // コマンドデータのみを含むバッファ（32バイト）
      const dataBuffer = new Uint8Array(32);

      // コマンドをバッファにコピー
      for (let i = 0; i < command.length && i < 32; i++) {
        dataBuffer[i] = command[i];
      }

      console.log('[useKeyboardKeymap] VIA コマンド送信:', {
        reportId: reportId,
        bufferSize: dataBuffer.length,
        command: Array.from(command),
        fullBuffer: Array.from(dataBuffer.slice(0, Math.min(10, dataBuffer.length))),
      });

      // 通常出力レポートで送信（Remapと同じパターン）
      try {
        await device.sendReport(reportId, dataBuffer);
        console.log('[useKeyboardKeymap] 出力レポート送信成功');
      } catch (err) {
        console.error('[useKeyboardKeymap] 出力レポート送信エラー:', err);
        // フィーチャーレポートの試行にフォールバック
        console.log('[useKeyboardKeymap] フィーチャーレポートでリトライ...');
        try {
          await device.sendFeatureReport(reportId, dataBuffer);
          console.log('[useKeyboardKeymap] フィーチャーレポート送信成功（フォールバック）');
        } catch (fallbackErr) {
          console.error('[useKeyboardKeymap] フィーチャーレポート送信エラー（フォールバック失敗）:', fallbackErr);
          throw err;
        }
      }

      // 注: レスポンスは inputreport イベントリスナーで取得される
      // このメソッド呼び出し側でレスポンス待機を処理する
      return { success: true };
    } catch (err: any) {
      console.error('[useKeyboardKeymap] VIA コマンド送信エラー:', err);
      throw err;
    }
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
    rawHIDData: readonly(rawHIDData),
    fetchKeymap,
    getRawDataForDisplay,
  };
}
