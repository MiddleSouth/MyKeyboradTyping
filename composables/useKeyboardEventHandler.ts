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
  function normalizeTypingInputChar(keyEvent: KeyInputEvent): string {
    const directInput = keyEvent.key

    // 一般ケース: event.key をそのまま利用
    if (directInput.length === 1) {
      // 日本語ローマ字判定は小文字ベースなので、英字のみ小文字へ正規化
      if (/^[A-Z]$/.test(directInput)) {
        return directInput.toLowerCase()
      }
      return directInput
    }

    // フォールバック: IME/配列差異で event.key が文字にならない場合、物理キーコードから復元
    if (/^Key[A-Z]$/.test(keyEvent.code)) {
      return keyEvent.code.slice(3).toLowerCase()
    }

    return directInput
  }

  function onKeyDown(event: KeyboardEvent) {
    const keyEvent = convertKeyDown(event)
    if (!keyEvent) return
    
    event.preventDefault()
    
    // キーマップがある場合のみハイライト処理
    if (rawHIDData.value) {
      const matchedKeys = findKeysInAllLayers(keyEvent.qmkKeycode)
      
      matchedKeys.forEach((positions, layer) => {
        pressKeys(layer, positions)
      })
    }

    // タイピング判定処理（常に実行）
    if (onTypingInput) {
      const inputChar = normalizeTypingInputChar(keyEvent)
      
      // 英数字、スペース、記号（プログラミングで使用する記号を含む）を判定対象に
      if (inputChar.length === 1 && /^[a-zA-Z0-9 \-,.\/@;:\[\]'"{}()<>!=&|+*%?$#_`~\\]$/.test(inputChar)) {
        onTypingInput(inputChar, event)
      } else if (inputChar === 'Enter') {
        onTypingInput('\n', event) // Enterキーを改行文字として渡す（イベントも渡す）
      }
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    const keyEvent = convertKeyUp(event)
    if (!keyEvent) return
    
    event.preventDefault()
    
    // キーマップがある場合のみハイライト処理
    if (rawHIDData.value) {
      const matchedKeys = findKeysInAllLayers(keyEvent.qmkKeycode)
      
      matchedKeys.forEach((positions, layer) => {
        releaseKeys(layer, positions)
      })
    }
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
