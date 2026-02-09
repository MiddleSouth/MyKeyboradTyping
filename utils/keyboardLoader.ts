import { createLogger } from '../composables/useLogger'
import { getBaseURL } from './baseUrl'

const logger = createLogger('KeyboardLoader')

/**
 * Keyboard definition (KLE format with metadata)
 */
export interface KeyboardDefinition {
  name: string;
  author?: string;
  notes?: string;
  vendorId?: string;
  productId?: string;
  productNames?: string[];
  source?: string;
  matrix: {
    rows: number;
    cols: number;
  };
  layouts: {
    labels?: string[][];  // レイアウトオプションのラベル（オプション）
    keymap: any[];        // KLE layout array (VIA/Remap標準)
  };
}

/**
 * Normalize product name to filename
 * @param productName - The product name to normalize
 * @returns Normalized filename (without .json extension)
 */
function normalizeToFilename(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/\s+/g, '')  // スペースを削除
    .replace(/[^a-z0-9-_]/g, '');  // 英数字とハイフン、アンダースコア以外を削除
}

/**
 * Load keyboard definition JSON from public/keyboards/
 * @param filename - The filename of the keyboard JSON (e.g., "ergo68.json")
 * @param baseURL - Optional base URL (e.g., '/MyKeyboradTyping/'). If not provided, will auto-detect.
 * @returns Promise of the keyboard definition
 */
export async function loadKeyboardDefinition(filename: string, baseURL?: string): Promise<KeyboardDefinition> {
  // baseURLが指定されていない場合は自動検出を試みる
  const normalizedBaseURL = baseURL ? (baseURL.endsWith('/') ? baseURL : baseURL + '/') : getBaseURL();
  
  // 絶対パスとして構築
  const path = `${normalizedBaseURL}keyboards/${filename}`;
  
  logger.debug('キーボード定義ファイル読み込み', { path, filename })
  
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load keyboard definition: ${filename} (Path: ${path}, Status: ${response.status})`);
  }
  return response.json();
}

/**
 * Find keyboard definition by product name
 * Tries multiple filename patterns to find the keyboard definition
 * @param productName - The product name to search for
 * @param baseURL - Optional base URL (e.g., '/MyKeyboradTyping/')
 * @returns Keyboard definition or undefined if not found
 */
export async function findKeyboardByProductName(
  productName: string,
  baseURL?: string
): Promise<KeyboardDefinition | undefined> {
  // 試行するファイル名パターンのリスト
  const patterns = [
    normalizeToFilename(productName),  // "Salicylic_acid3 Ergo68" → "salicylicacid3ergo68"
    normalizeToFilename(productName).replace(/.*?([a-z0-9]+)$/, '$1'),  // 最後の単語を抽出 → "ergo68"
    productName.toLowerCase().replace(/\s+/g, '-'),  // "Ergo68" → "ergo-68"
    productName.toLowerCase().replace(/\s+/g, '_'),  // "Ergo68" → "ergo_68"
  ];
  
  // 重複を削除
  const uniquePatterns = [...new Set(patterns)];
  
  // 各パターンを試行
  for (const pattern of uniquePatterns) {
    if (!pattern) continue;
    
    try {
      const definition = await loadKeyboardDefinition(`${pattern}.json`, baseURL);
      
      // productNamesが一致するか確認
      if (definition.productNames && definition.productNames.some((name) =>
        productName.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(productName.toLowerCase())
      )) {
        return definition;
      }
      
      // productNamesがなくても、ファイルが見つかれば返す
      return definition;
    } catch (error) {
      // このパターンでは見つからなかったので次を試す
      continue;
    }
  }
  
  return undefined;
}
