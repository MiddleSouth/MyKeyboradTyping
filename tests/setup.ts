// Vueのグローバル関数をテスト環境で利用可能にする
import { ref as vueRef, computed as vueComputed, readonly as vueReadonly } from 'vue'

// TypeScript用のグローバル型定義の拡張
declare global {
  // eslint-disable-next-line no-var
  var ref: typeof vueRef
  // eslint-disable-next-line no-var
  var computed: typeof vueComputed
  // eslint-disable-next-line no-var
  var readonly: typeof vueReadonly
}

// グローバルスコープに登録
globalThis.ref = vueRef
globalThis.computed = vueComputed
globalThis.readonly = vueReadonly
