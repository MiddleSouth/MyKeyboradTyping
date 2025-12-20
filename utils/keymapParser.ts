/**
 * キーマップデータのパース用ユーティリティ関数
 */

/**
 * 2バイトのデータからキーコードを読み取る（ビッグエンディアン）
 * @param byte1 上位バイト
 * @param byte2 下位バイト
 * @returns 16bitキーコード
 */
export function readKeycode(byte1: number, byte2: number): number {
  return (byte1 << 8) | byte2;
}

/**
 * バイト配列をキーコードの2次元配列（行×列）に変換
 * VIAプロトコルではキーコードは2バイト（ビッグエンディアン）で表現される
 * 
 * @param byteArray キーマップの生バイト配列
 * @param rows キーボードの行数
 * @param cols キーボードの列数
 * @returns キーコードの2次元配列 [row][col]
 */
export function parseLayerBuffer(byteArray: number[], rows: number, cols: number): number[][] {
  const layerKeymap: number[][] = [];
  let dataIndex = 0;

  for (let row = 0; row < rows; row++) {
    layerKeymap[row] = [];
    for (let col = 0; col < cols; col++) {
      const keycode = readKeycode(byteArray[dataIndex], byteArray[dataIndex + 1]);
      layerKeymap[row][col] = keycode;
      dataIndex += 2;
    }
  }

  return layerKeymap;
}
