import { ref, readonly, computed } from 'vue';
import { createLogger } from './useLogger';

const logger = createLogger('LayerManager');

/**
 * キーボードレイヤーの表示状態を管理するComposable
 */
export function useLayerManager(initialLayer: number = 0) {
  // 表示中のレイヤーを管理（複数レイヤー同時表示可能）
  const visibleLayers = ref(new Set<number>([initialLayer]));
  
  // 現在アクティブなレイヤー（入力判定などに使用）
  const currentLayer = ref(initialLayer);

  /**
   * レイヤーの表示・非表示を切り替え
   */
  function toggleLayer(layer: number): void {
    if (visibleLayers.value.has(layer)) {
      visibleLayers.value.delete(layer);
      logger.debug(`Layer ${layer} を非表示にしました`);
    } else {
      visibleLayers.value.add(layer);
      logger.debug(`Layer ${layer} を表示しました`);
    }
    // Setの変更を検知させるため、新しいSetを作成
    visibleLayers.value = new Set(visibleLayers.value);
  }

  /**
   * 指定したレイヤーを表示
   */
  function showLayer(layer: number): void {
    if (!visibleLayers.value.has(layer)) {
      visibleLayers.value.add(layer);
      visibleLayers.value = new Set(visibleLayers.value);
      logger.debug(`Layer ${layer} を表示しました`);
    }
  }

  /**
   * 指定したレイヤーを非表示
   */
  function hideLayer(layer: number): void {
    if (visibleLayers.value.has(layer)) {
      visibleLayers.value.delete(layer);
      visibleLayers.value = new Set(visibleLayers.value);
      logger.debug(`Layer ${layer} を非表示にしました`);
    }
  }

  /**
   * 指定したレイヤーのみを表示（他のレイヤーは非表示）
   */
  function showOnlyLayer(layer: number): void {
    visibleLayers.value = new Set([layer]);
    logger.debug(`Layer ${layer} のみを表示しました`);
  }

  /**
   * すべてのレイヤーを非表示
   */
  function hideAllLayers(): void {
    visibleLayers.value = new Set();
    logger.debug('すべてのレイヤーを非表示にしました');
  }

  /**
   * すべてのレイヤーを表示
   */
  function showAllLayers(maxLayer: number): void {
    const allLayers = Array.from({ length: maxLayer + 1 }, (_, i) => i);
    visibleLayers.value = new Set(allLayers);
    logger.debug(`Layer 0-${maxLayer} をすべて表示しました`);
  }

  /**
   * 指定したレイヤーが表示中かどうか判定
   */
  function isLayerVisible(layer: number): boolean {
    return visibleLayers.value.has(layer);
  }

  /**
   * 現在アクティブなレイヤーを変更
   */
  function setActiveLayer(layer: number): void {
    currentLayer.value = layer;
    logger.debug(`アクティブレイヤーを ${layer} に変更しました`);
  }

  /**
   * 表示中のレイヤー数
   */
  const visibleLayerCount = computed(() => visibleLayers.value.size);

  return {
    visibleLayers: readonly(visibleLayers),
    currentLayer: readonly(currentLayer),
    visibleLayerCount,
    toggleLayer,
    showLayer,
    hideLayer,
    showOnlyLayer,
    hideAllLayers,
    showAllLayers,
    isLayerVisible,
    setActiveLayer,
  };
}
