/**
 * 開発用ロガー
 * 環境変数で制御可能なログ出力
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private enabled: boolean;
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
    // 開発環境でのみログを有効化（Viteの環境判定）
    // 本番ビルドではimport.meta.env.DEVはfalseになる
    this.enabled = import.meta.env?.DEV ?? true;
  }

  debug(...args: any[]) {
    if (this.enabled) {
      console.log(`[${this.prefix}]`, ...args);
    }
  }

  info(...args: any[]) {
    if (this.enabled) {
      console.info(`[${this.prefix}]`, ...args);
    }
  }

  warn(...args: any[]) {
    if (this.enabled) {
      console.warn(`[${this.prefix}]`, ...args);
    }
  }

  error(...args: any[]) {
    // エラーは常に出力
    console.error(`[${this.prefix}]`, ...args);
  }
}

/**
 * ロガーインスタンスを作成
 */
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}
