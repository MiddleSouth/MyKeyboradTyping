import { ref, type Ref } from 'vue';
import type { RawKeymapData } from '../types/keyboard';
import { createLogger } from './useLogger';

const logger = createLogger('KeymapMatcher');

/**
 * キーマップ内でキーコードに対応する位置を検索するComposable
 */
export function useKeymapMatcher(keymapData: Ref<RawKeymapData | null>) {
  /**
   * 指定されたレイヤー内で、指定されたキーコードを持つすべてのマトリックス位置を検索
   * @param keycode 検索対象のキーコード
   * @param layer 検索対象のレイヤー番号
   * @returns マトリックス位置のSet（"row,col" の形式）
   */
  function findKeysInLayer(keycode: number, layer: number): Set<string> {
    const result = new Set<string>();
    
    if (!keymapData.value) {
      return result;
    }
    
    const layerData = keymapData.value.keymap_by_layer[layer];
    if (!layerData) {
      logger.debug(`Layer ${layer} が見つかりません`);
      return result;
    }
    
    // 各行・列を走査
    for (let row = 0; row < layerData.length; row++) {
      for (let col = 0; col < layerData[row].length; col++) {
        if (layerData[row][col] === keycode) {
          result.add(`${row},${col}`);
        }
      }
    }
    
    if (result.size > 0) {
      logger.debug(
        `Layer ${layer}: キーコード 0x${keycode.toString(16).toUpperCase().padStart(4, '0')} が ${result.size} 箇所で見つかりました`,
        Array.from(result)
      );
    }
    
    return result;
  }

  /**
   * すべてのレイヤーで指定されたキーコードを持つマトリックス位置を検索
   * @param keycode 検索対象のキーコード
   * @returns レイヤー番号 → マトリックス位置のSetのMap
   */
  function findKeysInAllLayers(keycode: number): Map<number, Set<string>> {
    const result = new Map<number, Set<string>>();
    
    if (!keymapData.value) {
      return result;
    }
    
    const layerCount = keymapData.value.layerCount;
    
    for (let layer = 0; layer < layerCount; layer++) {
      const positions = findKeysInLayer(keycode, layer);
      if (positions.size > 0) {
        result.set(layer, positions);
      }
    }
    
    logger.debug(
      `キーコード 0x${keycode.toString(16).toUpperCase().padStart(4, '0')} は ${result.size} レイヤーで見つかりました`
    );
    
    return result;
  }

  /**
   * 指定したマトリックス位置のキーコードを取得
   * @param row 行番号
   * @param col 列番号
   * @param layer レイヤー番号
   * @returns キーコード（見つからない場合はnull）
   */
  function getKeycodeAt(row: number, col: number, layer: number): number | null {
    if (!keymapData.value) {
      return null;
    }
    
    const layerData = keymapData.value.keymap_by_layer[layer];
    if (!layerData || !layerData[row] || layerData[row][col] === undefined) {
      return null;
    }
    
    return layerData[row][col];
  }

  /**
   * キーマップが利用可能かどうか判定
   */
  function isKeymapAvailable(): boolean {
    return keymapData.value !== null;
  }

  /**
   * レイヤー数を取得
   */
  function getLayerCount(): number {
    return keymapData.value?.layerCount ?? 0;
  }

  return {
    findKeysInLayer,
    findKeysInAllLayers,
    getKeycodeAt,
    isKeymapAvailable,
    getLayerCount,
  };
}
