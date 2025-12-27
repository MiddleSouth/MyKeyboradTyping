import { onMounted, onUnmounted, type Ref } from 'vue'
import type { RawKeymapData } from '../types/keyboard'

/**
 * キー入力イベント（useKeyInputから返される形式）
 */
interface KeyInputEvent {
  key: string
  qmkKeycode: number
  code: string
}

/**
 * キーボードイベントハンドラー
 * キー入力を処理し、キーハイライトとタイピング判定を統合
 */
export function useKeyboardEventHandler(
  rawHIDData: Ref<RawKeymapData | null>,
  convertKeyDown: (event: KeyboardEvent) => KeyInputEvent | null,
  convertKeyUp: (event: KeyboardEvent) => KeyInputEvent | null,
  findKeysInAllLayers: (keycode: number) => Map<number, Set<string>>,
  pressKeys: (layer: number, positions: Set<string>) => void,
  releaseKeys: (layer: number, positions: Set<string>) => void,
  onTypingInput?: (inputChar: string, event?: KeyboardEvent) => void
) {
  function onKeyDown(event: KeyboardEvent) {
    const keyEvent = convertKeyDown(event)
    if (!keyEvent || !rawHIDData.value) return
    
    event.preventDefault()
    
    const matchedKeys = findKeysInAllLayers(keyEvent.qmkKeycode)
    
    matchedKeys.forEach((positions, layer) => {
      pressKeys(layer, positions)
    })

    // タイピング判定処理
    if (onTypingInput) {
      const inputChar = keyEvent.key
      
      // 英数字、スペース、Enterを判定対象に
      if (inputChar.length === 1 && /^[a-zA-Z0-9 ]$/.test(inputChar)) {
        onTypingInput(inputChar, event)
      } else if (inputChar === 'Enter') {
        onTypingInput('\n', event) // Enterキーを改行文字として渡す（イベントも渡す）
      }
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    const keyEvent = convertKeyUp(event)
    if (!keyEvent || !rawHIDData.value) return
    
    event.preventDefault()
    
    const matchedKeys = findKeysInAllLayers(keyEvent.qmkKeycode)
    
    matchedKeys.forEach((positions, layer) => {
      releaseKeys(layer, positions)
    })
  }

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)
  })

  return {
    onKeyDown,
    onKeyUp
  }
}
