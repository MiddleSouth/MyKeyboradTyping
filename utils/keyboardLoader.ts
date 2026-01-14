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
  layout: any[]; // KLE layout array
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
 * @returns Promise of the keyboard definition
 */
export async function loadKeyboardDefinition(filename: string): Promise<KeyboardDefinition> {
  const response = await fetch(`/keyboards/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load keyboard definition: ${filename}`);
  }
  return response.json();
}

/**
 * Find keyboard definition by product name
 * Tries multiple filename patterns to find the keyboard definition
 * @param productName - The product name to search for
 * @returns Keyboard definition or undefined if not found
 */
export async function findKeyboardByProductName(
  productName: string
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
      const definition = await loadKeyboardDefinition(`${pattern}.json`);
      
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
