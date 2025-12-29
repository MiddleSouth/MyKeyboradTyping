import { ref, readonly } from 'vue';
import type { KeyboardDevice } from '../types/keyboard';

/**
 * キーボードの選択状態とグローバルエラーを管理するComposable
 * アプリケーション全体で単一のキーボード選択状態を共有
 */
const selectedKeyboard = ref<KeyboardDevice | null>(null);
const globalError = ref<string | null>(null);

export function useKeyboardState() {
  /**
   * キーボードを選択
   */
  function setSelectedKeyboard(keyboard: KeyboardDevice | null) {
    selectedKeyboard.value = keyboard;
    // キーボード選択時にエラーをクリア
    if (keyboard) {
      clearError();
    }
  }

  /**
   * エラーメッセージを設定
   */
  function setError(error: string | null) {
    globalError.value = error;
  }

  /**
   * エラーをクリア
   */
  function clearError() {
    globalError.value = null;
  }

  /**
   * 選択状態をリセット
   */
  function reset() {
    selectedKeyboard.value = null;
    globalError.value = null;
  }

  return {
    selectedKeyboard: readonly(selectedKeyboard),
    error: readonly(globalError),
    setSelectedKeyboard,
    setError,
    clearError,
    reset,
  };
}
