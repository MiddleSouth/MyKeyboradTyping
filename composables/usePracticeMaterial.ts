import { ref, computed, readonly } from 'vue'
import { createLogger } from './useLogger'

const logger = createLogger('PracticeMaterial')

/**
 * 練習素材の定義
 */
export interface PracticeMaterial {
  id: string
  title: string
  content: string[]  // 複数の単語をサポート
  difficulty: 'easy' | 'normal' | 'hard'
  isJapanese?: boolean  // 日本語かどうか
}

/**
 * ビルトイン練習素材
 */
const BUILT_IN_MATERIALS: PracticeMaterial[] = [
  // ============ 日本語基礎練習 ============
  {
    id: 'jp-hiragana-basic',
    title: '日本語 - ひらがな基礎',
    content: [
      'あいうえお\n',
      'かきくけこ\n',
      'さしすせそ\n',
      'たちつてと\n',
      'なにぬねの\n',
      'はひふへほ\n',
      'まみむめも\n',
      'やゆよ\n',
      'らりるれろ\n',
      'わをん\n',
      'がぎぐげご\n',
      'ざじずぜぞ\n',
      'だぢづでど\n',
      'ばびぶべぼ\n',
      'ぱぴぷぺぽ\n'
    ],
    difficulty: 'easy',
    isJapanese: true
  },
  {
    id: 'jp-hiragana-youon',
    title: '日本語 - 拗音・促音',
    content: [
      'きゃきゅきょ\n',
      'しゃしゅしょ\n',
      'ちゃちゅちょ\n',
      'にゃにゅにょ\n',
      'ひゃひゅひょ\n',
      'みゃみゅみょ\n',
      'りゃりゅりょ\n',
      'ぎゃぎゅぎょ\n',
      'じゃじゅじょ\n',
      'びゃびゅびょ\n',
      'ぴゃぴゅぴょ\n',
      'っ\n',
      'あっ\n',
      'きって\n',
      'がっこう\n',
      'たっち\n',
      'ずっと\n',
      'さっき\n',
      'まっすぐ\n',
      'けっこん\n'
    ],
    difficulty: 'easy',
    isJapanese: true
  },
  {
    id: 'jp-daily-words',
    title: '日本語 - 日常単語',
    content: [
      'こんにちは\n',
      'ありがとう\n',
      'おはよう\n',
      'こんばんは\n',
      'おやすみ\n',
      'いただきます\n',
      'ごちそうさま\n',
      'すみません\n',
      'よろしく\n',
      'がんばって\n',
      'たいへん\n',
      'じかん\n',
      'ばしょ\n',
      'きょう\n',
      'あした\n',
      'きのう\n',
      'しごと\n',
      'がっこう\n',
      'ともだち\n',
      'かぞく\n'
    ],
    difficulty: 'easy',
    isJapanese: true
  },
  {
    id: 'jp-hyphen-words',
    title: '日本語 - ハイフン付き単語',
    content: [
      'きーぼーど\n',
      'まうす\n',
      'でぃすぷれい\n',
      'ぷりんたー\n',
      'すぴーかー\n',
      'へっどふぉん\n',
      'まいく\n',
      'うぇぶかめら\n',
      'るーたー\n',
      'もでむ\n',
      'けーぶる\n',
      'めもりー\n',
      'ふぁいる\n',
      'ふぉるだ\n',
      'でーた\n',
      'ねっとわーく\n',
      'いんたーねっと\n',
      'ぶらうざ\n',
      'せきゅりてぃ\n',
      'ぱすわーど\n'
    ],
    difficulty: 'normal',
    isJapanese: true
  },
  {
    id: 'jp-sentences',
    title: '日本語 - 文章練習',
    content: [
      'こんにちは、おげんきですか。\n',
      'きょうは いいてんきですね。\n',
      'ほんとうに ありがとう ございます。\n',
      'どうぞ よろしく おねがいします。\n',
      'きょうは おつかれさまでした。\n',
      'また あした おあいしましょう。\n',
      'これは わたしの ぺんです。\n',
      'わたしは だいがくせいです。\n',
      'きょうは にちようびです。\n',
      'あしたは しけんが あります。\n',
      'あの ほんやに いきました。\n',
      'らいしゅうは りょこうに いきます。\n',
      'まいあさ じょぎんぐ しています。\n',
      'この りょうりは おいしいです。\n',
      'いっしょに しょくじに いきましょう。\n',
      'かぞくと すごす じかんが すきです。\n',
      'としょかんで べんきょうします。\n',
      'あたらしい ぱそこんを かいました。\n',
      'えいがを みに いきませんか。\n',
      'てんきよほうを かくにんしました。\n'
    ],
    difficulty: 'normal',
    isJapanese: true
  },
  {
    id: 'jp-numbers',
    title: '日本語 - 数字を含む文章',
    content: [
      'わたしは 20さいです。\n',
      'きょうは 1がつ 1にちです。\n',
      'でんわばんごうは 090-1234-5678です。\n',
      'じかんは 10じ 30ぷんです。\n',
      'りんごを 3こ かいました。\n',
      'ぺーじは 123を みてください。\n',
      'ごうけいは 4500えんです。\n',
      '1から 100まで かぞえます。\n',
      'ばんごうは 42ばんです。\n',
      'ねんれいは 25さいいじょうです。\n',
      '365にち まいにち がんばります。\n',
      '2024ねん 12がつ 31にち。\n',
      'せきは 5れつめの 7ばんです。\n',
      'きょりは やく 15きろめーとるです。\n',
      'へやばんごうは 301です。\n'
    ],
    difficulty: 'normal',
    isJapanese: true
  },
  
  // ============ 英単語練習 ============
  {
    id: 'en-basic-words',
    title: '英単語 - 基礎',
    content: [
      'hello\n',
      'world\n',
      'welcome\n',
      'thank\n',
      'please\n',
      'time\n',
      'place\n',
      'today\n',
      'tomorrow\n',
      'yesterday\n',
      'work\n',
      'school\n',
      'friend\n',
      'family\n',
      'people\n',
      'water\n',
      'food\n',
      'house\n',
      'city\n',
      'country\n'
    ],
    difficulty: 'easy'
  },
  {
    id: 'en-tech-words',
    title: '英単語 - 技術用語',
    content: [
      'keyboard\n',
      'mouse\n',
      'display\n',
      'printer\n',
      'speaker\n',
      'headphone\n',
      'microphone\n',
      'webcam\n',
      'router\n',
      'modem\n',
      'cable\n',
      'memory\n',
      'file\n',
      'folder\n',
      'data\n',
      'network\n',
      'internet\n',
      'browser\n',
      'security\n',
      'password\n'
    ],
    difficulty: 'normal'
  },
  {
    id: 'en-programming',
    title: '英単語 - プログラミング',
    content: [
      'function\n',
      'variable\n',
      'constant\n',
      'array\n',
      'object\n',
      'method\n',
      'parameter\n',
      'argument\n',
      'return\n',
      'condition\n',
      'loop\n',
      'iteration\n',
      'async\n',
      'await\n',
      'promise\n',
      'callback\n',
      'interface\n',
      'implement\n',
      'extend\n',
      'inherit\n'
    ],
    difficulty: 'normal'
  },
  {
    id: 'en-numbers',
    title: '英語 - 数字を含む練習',
    content: [
      'I am 25 years old.\n',
      'The year is 2024.\n',
      'Room number is 301.\n',
      'Call me at 555-1234.\n',
      'Chapter 7, page 123.\n',
      'Version 3.14.5 released.\n',
      'Total is $49.99.\n',
      'Count from 1 to 100.\n',
      'Flight UA1234 departs at 10:30.\n',
      'ZIP code is 12345.\n',
      'My ID is 98765.\n',
      'Score: 85 out of 100.\n',
      'Address: 123 Main St.\n',
      'Born in 1995.\n',
      'Windows 11 is great.\n'
    ],
    difficulty: 'normal'
  },
  
  // ============ プログラミング練習（C#） ============
  {
    id: 'csharp-symbols',
    title: 'C# - 基本記号',
    content: [
      '{}\n',
      '[]\n',
      '()\n',
      ';\n',
      ':\n',
      '<>\n',
      '==\n',
      '!=\n',
      '&&\n',
      '||\n',
      '+=\n',
      '-=\n',
      '*=\n',
      '/=\n',
      '=>\n'
    ],
    difficulty: 'easy'
  },
  {
    id: 'csharp-keywords',
    title: 'C# - キーワード',
    content: [
      'class\n',
      'public\n',
      'private\n',
      'protected\n',
      'void\n',
      'string\n',
      'int\n',
      'bool\n',
      'return\n',
      'if\n',
      'else\n',
      'for\n',
      'while\n',
      'foreach\n',
      'new\n',
      'this\n',
      'base\n',
      'static\n',
      'async\n',
      'await\n'
    ],
    difficulty: 'easy'
  },
  {
    id: 'csharp-code-1',
    title: 'C# - コード例 1',
    content: [
      'public class Program\n',
      'private int count;\n',
      'public string Name { get; set; }\n',
      'return result;\n',
      'if (condition)\n',
      'for (int i = 0; i < length; i++)\n',
      'var result = new List<string>();\n',
      'await Task.Run(() => Process());\n',
      'Console.WriteLine("Hello");\n',
      'throw new Exception("Error");\n'
    ],
    difficulty: 'normal'
  },
  {
    id: 'csharp-code-2',
    title: 'C# - コード例 2',
    content: [
      'public async Task<bool> ValidateAsync()\n',
      'var items = list.Where(x => x.IsActive);\n',
      'string text = $"Count: {count}";\n',
      'try { Process(); } catch { }\n',
      'using var stream = File.OpenRead(path);\n',
      'record Person(string Name, int Age);\n',
      'List<int> numbers = [1, 2, 3, 4, 5];\n',
      'return value ?? defaultValue;\n',
      'if (item is not null && item.IsValid)\n',
      'await foreach (var item in source)\n'
    ],
    difficulty: 'hard'
  }
]

/**
 * 練習素材を管理するComposable
 */
export function usePracticeMaterial() {
  const materials = ref<PracticeMaterial[]>(BUILT_IN_MATERIALS)
  const currentMaterialIndex = ref(0)
  const currentWordIndex = ref(0)

  /**
   * 現在の練習素材
   */
  const currentMaterial = computed(() => {
    return materials.value[currentMaterialIndex.value] || null
  })

  /**
   * 現在の単語
   */
  const currentWord = computed(() => {
    if (!currentMaterial.value) return ''
    const words = currentMaterial.value.content
    if (currentWordIndex.value >= words.length) return ''
    return words[currentWordIndex.value]
  })

  /**
   * 現在の練習テキスト（後方互換性のため）
   */
  const currentText = computed(() => {
    return currentWord.value
  })

  /**
   * 総単語数
   */
  const totalWords = computed(() => {
    return currentMaterial.value?.content.length || 0
  })

  /**
   * すべての単語が完了したか
   */
  const isAllWordsCompleted = computed(() => {
    return currentWordIndex.value >= totalWords.value
  })

  /**
   * 全体の進捗情報（総文字数と現在の文字位置）
   */
  const overallProgress = computed(() => {
    if (!currentMaterial.value) {
      return { current: 0, total: 0 }
    }
    
    const words = currentMaterial.value.content
    let totalChars = 0
    let currentChars = 0
    
    // すべての単語の文字数を計算
    for (let i = 0; i < words.length; i++) {
      totalChars += words[i].length
    }
    
    // 現在までに完了した文字数を計算
    for (let i = 0; i < currentWordIndex.value; i++) {
      currentChars += words[i].length
    }
    
    return { current: currentChars, total: totalChars }
  })

  /**
   * 次の単語に進む
   */
  function nextWord(): boolean {
    console.log('[nextWord] 呼び出し - currentWordIndex:', currentWordIndex.value, 'totalWords:', totalWords.value)
    if (currentWordIndex.value < totalWords.value - 1) {
      currentWordIndex.value++
      console.log('[nextWord] 次の単語に進みました:', currentWordIndex.value, '/', totalWords.value)
      logger.debug(`次の単語に進みました: ${currentWord.value} (${currentWordIndex.value + 1}/${totalWords.value})`)
      return true
    }
    currentWordIndex.value++
    console.log('[nextWord] 最後の単語完了 - currentWordIndex:', currentWordIndex.value, 'isAllWordsCompleted:', currentWordIndex.value >= totalWords.value)
    logger.debug('これが最後の単語です')
    return false
  }

  /**
   * 次の素材に進む
   */
  function nextMaterial(): boolean {
    if (currentMaterialIndex.value < materials.value.length - 1) {
      currentMaterialIndex.value++
      currentWordIndex.value = 0  // 単語インデックスをリセット
      logger.debug(`次の素材に進みました: ${currentMaterial.value?.title}`)
      return true
    }
    logger.debug('これが最後の素材です')
    return false
  }

  /**
   * 前の素材に戻る
   */
  function previousMaterial(): boolean {
    if (currentMaterialIndex.value > 0) {
      currentMaterialIndex.value--
      currentWordIndex.value = 0  // 単語インデックスをリセット
      logger.debug(`前の素材に戻りました: ${currentMaterial.value?.title}`)
      return true
    }
    logger.debug('これが最初の素材です')
    return false
  }

  /**
   * 指定したIDの素材を選択
   */
  function selectMaterial(id: string): boolean {
    const index = materials.value.findIndex(m => m.id === id)
    if (index !== -1) {
      currentMaterialIndex.value = index
      currentWordIndex.value = 0  // 単語インデックスをリセット
      logger.debug(`素材を選択しました: ${currentMaterial.value?.title}`)
      return true
    }
    logger.warn(`素材が見つかりません: ${id}`)
    return false
  }

  /**
   * 素材をリセット（最初に戻す）
   */
  function reset(): void {
    currentMaterialIndex.value = 0
    currentWordIndex.value = 0
    logger.debug('素材をリセットしました')
  }

  /**
   * 現在の素材の単語インデックスだけをリセット
   */
  function resetWords(): void {
    currentWordIndex.value = 0
    logger.debug('単語インデックスをリセットしました')
  }

  /**
   * 練習素材を追加
   */
  function addMaterial(material: PracticeMaterial): void {
    materials.value.push(material)
    logger.debug(`素材を追加しました: ${material.title}`)
  }

  return {
    materials: readonly(materials),
    currentMaterial,
    currentWord,
    currentText,
    currentWordIndex: readonly(currentWordIndex),
    totalWords,
    isAllWordsCompleted,
    overallProgress,
    currentMaterialIndex: readonly(currentMaterialIndex),
    nextWord,
    nextMaterial,
    previousMaterial,
    selectMaterial,
    reset,
    resetWords,
    addMaterial,
  }
}
