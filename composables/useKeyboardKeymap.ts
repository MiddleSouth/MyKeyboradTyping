import { ref, readonly } from 'vue';
import type { KeyboardDevice, KeymapData, RawKeymapData } from '../types/keyboard';
import type { HIDDevice, HIDInputReportEvent } from '../types/webhid';
import { useKeyboardState } from './useKeyboardState';
import { 
  VIA_USAGE_PAGE, 
  VIA_USAGE, 
  VIA_COMMAND,
  MIN_VIA_PROTOCOL_VERSION,
  VIA_BUFFER_CHUNK_SIZE,
  VIA_REPORT_SIZE
} from '../constants/via';
import { createLogger } from './useLogger';
import { parseLayerBuffer } from '../utils/keymapParser';

const logger = createLogger('KeyboardKeymap');

/**
 * WebHIDを通じてキーマップを取得するComposable
 */
export function useKeyboardKeymap() {
  const { setError } = useKeyboardState();
  const keymapData = ref<KeymapData | null>(null);
  const isLoading = ref(false);
  const rawHIDData = ref<RawKeymapData | null>(null);

  /**
   * マッチするデバイスから最適なVIA対応デバイスを選択
   * 優先順位: VIA専用コレクション > outputReports持ち > 最初のデバイス
   */
  function selectBestDevice(matchingDevices: HIDDevice[]): HIDDevice {
    if (matchingDevices.length === 0) {
      throw new Error('デバイスが見つかりません');
    }

    logger.debug('マッチするデバイス数:', matchingDevices.length);

    // VIA対応のコレクションを持つデバイスを優先的に選択
    let selectedDevice = matchingDevices.find((device) =>
      device.collections?.some((c) => 
        c.usagePage === VIA_USAGE_PAGE && c.usage === VIA_USAGE
      )
    );

    // VIA対応デバイスがなければ、outputReportsを持つデバイスを選択
    if (!selectedDevice) {
      selectedDevice = matchingDevices.find((device) =>
        device.collections?.some((c) => 
          c.outputReports && c.outputReports.length > 0
        )
      );
    }

    // それでもなければ最初のデバイスを使用
    if (!selectedDevice) {
      selectedDevice = matchingDevices[0];
    }

    logger.debug('選択されたデバイス:', {
      productName: selectedDevice.productName,
      collections: selectedDevice.collections?.length,
    });

    return selectedDevice;
  }

  /**
   * デバイスが開いていることを保証（閉じている場合は開く）
   */
  async function ensureDeviceOpen(device: HIDDevice): Promise<void> {
    if (!device.opened) {
      logger.debug('デバイスを開きます:', device.productName);
      await device.open();
    }
  }

  /**
   * 選択されたキーボードからキーマップを取得
   */
  async function fetchKeymap(keyboard: KeyboardDevice): Promise<KeymapData | null> {
    isLoading.value = true;

    try {
      if (!navigator.hid) {
        throw new Error('WebHID APIが利用できません');
      }
      const hid = navigator.hid;

      // すべてのHIDデバイスを取得（同じ物理デバイスが複数のインターフェースとして現れる）
      const devices = await hid.getDevices();
      logger.debug('すべてのHIDデバイス:');
      devices.forEach((device, index) => {
        logger.debug(`  デバイス ${index}:`, {
          productName: device.productName,
          vendorId: `0x${device.vendorId.toString(16).padStart(4, '0')}`,
          productId: `0x${device.productId.toString(16).padStart(4, '0')}`,
          opened: device.opened,
          collections: device.collections?.length || 0,
        });
        if (device.collections) {
          device.collections.forEach((collection, colIndex) => {
            logger.debug(`    コレクション ${colIndex}:`, {
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
        (device) =>
          device.vendorId === keyboard.vendorId &&
          device.productId === keyboard.productId
      );

      // 最適なデバイスを選択
      const selectedDevice = selectBestDevice(matchingDevices);

      // デバイスが閉じられている場合は開く
      await ensureDeviceOpen(selectedDevice);

      // キーマップを取得（VIA互換コマンド）
      // VIAのキーマップ取得コマンド
      const keymapRawData = await getKeymapViaVIA(selectedDevice);
      rawHIDData.value = keymapRawData;

      // 生データを構造化
      const keymap = parseKeymapData(keymapRawData, keyboard);
      keymapData.value = keymap;

      return keymap;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'キーマップ取得中にエラーが発生しました';
      setError(errorMsg);
      logger.error('キーマップ取得エラー:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * VIA対応のコレクションを選択
   * VIA専用コレクション（0xff60/0x61）または通常のキーボードコレクション（0x01/0x06）を返す
   */
  function selectVIACollection(device: HIDDevice): { collection: any; reportId: number } {
    logger.debug('デバイス情報:', {
      productName: device.productName,
      opened: device.opened,
      collections: device.collections?.length || 0,
    });

    // デバッグ: すべてのコレクション情報を出力
    logger.debug('すべてのコレクション情報:');
    if (device.collections) {
      device.collections.forEach((collection, index) => {
        logger.debug(`  コレクション ${index}:`, {
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
      (c) => c.usagePage === VIA_USAGE_PAGE && c.usage === VIA_USAGE
    );

    if (targetCollection) {
      logger.debug('VIA専用コレクション発見:', targetCollection);
    } else {
      // VIAコレクションがない場合は、通常のキーボードコレクションを使用
      // QMKのVIAサポートは通常のキーボードエンドポイント経由でも動作する
      targetCollection = device.collections?.find(
        (c) => c.usagePage === 0x01 && c.usage === 0x06
      );
      
      if (targetCollection) {
        logger.debug('通常のキーボードコレクションを使用（VIAコマンドは送信可能）:', targetCollection);
      } else {
        logger.error('使用可能なコレクションが見つかりません');
        throw new Error('キーボードコレクションが見つかりません。');
      }
    }

    // ReportID を特定（通常は0）
    let reportId = 0;
    if (targetCollection.outputReports && targetCollection.outputReports.length > 0) {
      reportId = targetCollection.outputReports[0].reportId || 0;
      logger.debug('reportId:', reportId);
    } else {
      logger.debug('outputReports未定義、reportId=0を使用');
    }

    return { collection: targetCollection, reportId };
  }

  /**
   * レスポンス待機用のPromiseを作成するヘルパー関数
   */
  function createResponsePromise(device: HIDDevice, key: string): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`レスポンスタイムアウト: ${key}`));
      }, 5000);  // 5秒に延長（Remapでは長めに設定）

      const listener = (event: HIDInputReportEvent) => {
        const data = event.data;
        const buffer = new Uint8Array(data.buffer);
        
        logger.debug(`レスポンス受信 (${key}):`, Array.from(buffer.slice(0, 10)));
        
        clearTimeout(timeout);
        device.removeEventListener('inputreport', listener);
        resolve(buffer);
      };

      device.addEventListener('inputreport', listener);
    });
  }

  /**
   * VIAプロトコルバージョンを取得
   * MIN_VIA_PROTOCOL_VERSION（0x0C）未満の場合はエラーをスロー
   */
  async function getProtocolVersion(device: HIDDevice, reportId: number): Promise<number> {
    logger.debug('ステップ 1: プロトコルバージョン確認');
    const versionResponsePromise = createResponsePromise(device, 'version');
    await sendVIACommand(device, [VIA_COMMAND.GET_PROTOCOL_VERSION], reportId);
    
    const versionBuffer = await versionResponsePromise;
    const viaProtocolVersion = (versionBuffer[1] << 8) | versionBuffer[2];
    logger.debug('プロトコルバージョン:', `0x${viaProtocolVersion.toString(16).padStart(4, '0')}`);
    
    // Remapと同じく、MIN_VIA_PROTOCOL_VERSION未満は非対応
    if (viaProtocolVersion < MIN_VIA_PROTOCOL_VERSION) {
      throw new Error(`VIAプロトコルバージョン ${viaProtocolVersion} は対応していません。0x0C以上が必要です。`);
    }

    return viaProtocolVersion;
  }

  /**
   * キーボードのレイヤー数を取得
   * 取得失敗時はデフォルト値4を返す
   */
  async function getLayerCount(device: HIDDevice, reportId: number): Promise<number> {
    logger.debug('ステップ 2: レイヤー数取得');
    const layerCountResponsePromise = createResponsePromise(device, 'layerCount');
    await sendVIACommand(device, [VIA_COMMAND.DYNAMIC_KEYMAP_GET_LAYER_COUNT], reportId);
    
    try {
      const layerCountBuffer = await layerCountResponsePromise;
      const layerCount = layerCountBuffer[1];
      logger.debug('レイヤー数:', layerCount);
      return layerCount;
    } catch (err) {
      const defaultLayerCount = 4;
      logger.warn('レイヤー数取得エラー、デフォルト値を使用:', defaultLayerCount, err);
      return defaultLayerCount;
    }
  }

  /**
   * キーボードのマトリクスサイズを取得
   * TODO: 将来的にはキーボード定義JSONから取得すべき
   */
  function getMatrixSize(): { rows: number; cols: number } {
    // 現在は固定値（Ergo68用）
    const rows = 5;
    const cols = 14;
    logger.debug('マトリクスサイズ（固定値）: rows=', rows, 'cols=', cols);
    return { rows, cols };
  }

  /**
   * 全レイヤーのキーマップデータをVIAプロトコルで取得
   * 各レイヤーをバッファ読み込みでフェッチし、バイト配列をキーコード配列に変換
   */
  async function fetchAllLayers(
    device: HIDDevice,
    reportId: number,
    layerCount: number,
    rows: number,
    cols: number
  ): Promise<{ [layerNumber: number]: number[][] }> {
    const keymapByLayer: { [layerNumber: number]: number[][] } = {};

    for (let layer = 0; layer < layerCount; layer++) {
      logger.debug(`ステップ ${3 + layer}: レイヤー ${layer} のキーマップ取得`);
      
      // Remapと同じく、バッファを28バイトずつ読み込む
      const totalSize = rows * cols * 2; // 各キーは2バイト
      let offset = layer * totalSize;
      const keymapData: number[] = [];
      
      let remainingSize = totalSize;
      while (remainingSize > 0) {
        const size = Math.min(VIA_BUFFER_CHUNK_SIZE, remainingSize);
        
        const bufferResponsePromise = createResponsePromise(device, `buffer-${layer}-${offset}`);
        await sendVIACommand(device, [
          VIA_COMMAND.DYNAMIC_KEYMAP_GET_BUFFER,
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
          logger.debug(`バッファ読み込み: offset=${offset}, size=${size}, 取得=${size}バイト`);
        } catch (err) {
          logger.warn(`バッファ読み込みエラー: offset=${offset}`, err);
          // タイムアウトの場合は0で埋める
          for (let i = 0; i < size; i++) {
            keymapData.push(0);
          }
        }
        
        offset += size;
        remainingSize -= size;
      }
      
      // バイト配列をキーマップに変換
      const layerKeymap = parseLayerBuffer(keymapData, rows, cols);
      keymapByLayer[layer] = layerKeymap;
    }

    return keymapByLayer;
  }

  /**
   * RawKeymapDataオブジェクトを構築
   */
  function buildRawKeymapData(
    device: HIDDevice,
    rows: number,
    cols: number,
    layerCount: number,
    keymapByLayer: { [layerNumber: number]: number[][] }
  ): RawKeymapData {
    const result: RawKeymapData = {
      vendorId: device.vendorId,
      productId: device.productId,
      productName: device.productName,
      rows,
      cols,
      layerCount,
      keymap_by_layer: keymapByLayer,
      timestamp: new Date().toISOString(),
    };

    logger.debug('キーマップ取得完了:', result);
    return result;
  }

  /**
   * VIA互換のコマンドでキーマップを取得
   * 
   * Remapのキーマップ取得フローに基づく実装
   */
  async function getKeymapViaVIA(device: HIDDevice): Promise<RawKeymapData> {
    try {
      logger.debug('VIA プロトコルでキーマップ取得を開始');

      // 1. VIA対応コレクションを選択
      const { reportId } = selectVIACollection(device);

      // 2. プロトコルバージョンを確認
      await getProtocolVersion(device, reportId);

      // 3. レイヤー数を取得
      const layerCount = await getLayerCount(device, reportId);

      // 4. マトリクスサイズを取得
      const { rows, cols } = getMatrixSize();

      // 5. 全レイヤーのキーマップデータを取得
      const keymapByLayer = await fetchAllLayers(device, reportId, layerCount, rows, cols);

      // 6. 結果をまとめる
      return buildRawKeymapData(device, rows, cols, layerCount, keymapByLayer);
    } catch (err) {
      logger.error('VIA キーマップ取得エラー:', err);
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
  async function sendVIACommand(device: HIDDevice, command: number[], reportId: number = 0): Promise<{ success: boolean }> {
    try {
      // コマンドデータのみを含むバッファ
      const dataBuffer = new Uint8Array(VIA_REPORT_SIZE);

      // コマンドをバッファにコピー
      for (let i = 0; i < command.length && i < VIA_REPORT_SIZE; i++) {
        dataBuffer[i] = command[i];
      }

      logger.debug('VIA コマンド送信:', {
        reportId: reportId,
        bufferSize: dataBuffer.length,
        command: Array.from(command),
        fullBuffer: Array.from(dataBuffer.slice(0, Math.min(10, dataBuffer.length))),
      });

      // 通常出力レポートで送信（Remapと同じパターン）
      try {
        await device.sendReport(reportId, dataBuffer);
        logger.debug('出力レポート送信成功');
      } catch (err) {
        logger.error('出力レポート送信エラー:', err);
        // フィーチャーレポートの試行にフォールバック
        logger.debug('フィーチャーレポートでリトライ...');
        try {
          await device.sendFeatureReport(reportId, dataBuffer);
          logger.debug('フィーチャーレポート送信成功（フォールバック）');
        } catch (fallbackErr) {
          logger.error('フィーチャーレポート送信エラー（フォールバック失敗）:', fallbackErr);
          throw err;
        }
      }

      // 注: レスポンスは inputreport イベントリスナーで取得される
      // このメソッド呼び出し側でレスポンス待機を処理する
      return { success: true };
    } catch (err) {
      logger.error('VIA コマンド送信エラー:', err);
      throw err;
    }
  }

  /**
   * 生データからキーマップを解析
   * RawKeymapDataをKeymapData形式に変換
   */
  function parseKeymapData(rawData: RawKeymapData, keyboard: KeyboardDevice): KeymapData {
    logger.debug('キーマップデータをパース:', {
      layerCount: rawData.layerCount,
      rows: rawData.rows,
      cols: rawData.cols,
    });

    return {
      keyboard: {
        id: `${keyboard.vendorId}:${keyboard.productId}`,
        name: keyboard.productName,
      },
      layers: rawData.keymap_by_layer,
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
