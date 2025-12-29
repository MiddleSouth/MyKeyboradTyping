import { ref, readonly } from 'vue';
import { createLogger } from './useLogger';

const logger = createLogger('KeyHighlight');

/**
 * キーボードのキーハイライト状態を管理するComposable
 */
export function useKeyHighlight() {
  // レイヤーごとの押されているキーのマトリックス位置（"row,col" の形式）
  const pressedKeysByLayer = ref(new Map<number, Set<string>>());

  /**
   * 指定したレイヤーの指定した位置のキーを押下状態にする
   */
  function pressKey(layer: number, position: string): void {
    const layerKeys = pressedKeysByLayer.value.get(layer) || new Set<string>();
    layerKeys.add(position);
    pressedKeysByLayer.value.set(layer, layerKeys);
    
    // Mapの変更を検知させるため、新しいMapを作成
    pressedKeysByLayer.value = new Map(pressedKeysByLayer.value);
    
    logger.debug(`Layer ${layer}: キー "${position}" を押下状態にしました`);
  }

  /**
   * 複数のキーを一度に押下状態にする
   */
  function pressKeys(layer: number, positions: Set<string>): void {
    const layerKeys = pressedKeysByLayer.value.get(layer) || new Set<string>();
    positions.forEach(pos => layerKeys.add(pos));
    pressedKeysByLayer.value.set(layer, layerKeys);
    
    pressedKeysByLayer.value = new Map(pressedKeysByLayer.value);
    
    logger.debug(`Layer ${layer}: ${positions.size} 個のキーを押下状態にしました`);
  }

  /**
   * 指定したレイヤーの指定した位置のキーを解放状態にする
   */
  function releaseKey(layer: number, position: string): void {
    const layerKeys = pressedKeysByLayer.value.get(layer);
    if (!layerKeys) return;
    
    layerKeys.delete(position);
    
    if (layerKeys.size === 0) {
      pressedKeysByLayer.value.delete(layer);
    } else {
      pressedKeysByLayer.value.set(layer, layerKeys);
    }
    
    pressedKeysByLayer.value = new Map(pressedKeysByLayer.value);
    
    logger.debug(`Layer ${layer}: キー "${position}" を解放しました`);
  }

  /**
   * 複数のキーを一度に解放状態にする
   */
  function releaseKeys(layer: number, positions: Set<string>): void {
    const layerKeys = pressedKeysByLayer.value.get(layer);
    if (!layerKeys) return;
    
    positions.forEach(pos => layerKeys.delete(pos));
    
    if (layerKeys.size === 0) {
      pressedKeysByLayer.value.delete(layer);
    } else {
      pressedKeysByLayer.value.set(layer, layerKeys);
    }
    
    pressedKeysByLayer.value = new Map(pressedKeysByLayer.value);
    
    logger.debug(`Layer ${layer}: ${positions.size} 個のキーを解放しました`);
  }

  /**
   * 指定したレイヤーのすべてのキーをクリア
   */
  function clearLayer(layer: number): void {
    pressedKeysByLayer.value.delete(layer);
    pressedKeysByLayer.value = new Map(pressedKeysByLayer.value);
    logger.debug(`Layer ${layer}: すべてのキーをクリアしました`);
  }

  /**
   * すべてのレイヤーのキーをクリア
   */
  function clearAll(): void {
    pressedKeysByLayer.value.clear();
    pressedKeysByLayer.value = new Map(pressedKeysByLayer.value);
    logger.debug('すべてのレイヤーのキーをクリアしました');
  }

  /**
   * 指定したレイヤーの指定した位置のキーが押下状態かどうか判定
   */
  function isKeyPressed(layer: number, position: string): boolean {
    const layerKeys = pressedKeysByLayer.value.get(layer);
    return layerKeys ? layerKeys.has(position) : false;
  }

  /**
   * 指定したレイヤーの押下中のキー数を取得
   */
  function getPressedKeyCount(layer: number): number {
    const layerKeys = pressedKeysByLayer.value.get(layer);
    return layerKeys ? layerKeys.size : 0;
  }

  /**
   * 指定したレイヤーの押下中のキー位置一覧を取得
   */
  function getPressedKeys(layer: number): Set<string> | undefined {
    return pressedKeysByLayer.value.get(layer);
  }

  return {
    pressedKeysByLayer: readonly(pressedKeysByLayer),
    pressKey,
    pressKeys,
    releaseKey,
    releaseKeys,
    clearLayer,
    clearAll,
    isKeyPressed,
    getPressedKeyCount,
    getPressedKeys,
  };
}
