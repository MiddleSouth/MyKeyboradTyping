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
export const BUILT_IN_MATERIALS: PracticeMaterial[] = [
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
      'ふぁふぃふふぇふぉ\n',
      'わうぃううぇを\n',
      'てぃてゅとぅ\n',
      'でぃでゅどぅ\n',
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
  
  // ============ 数字・数式練習 ============
  {
    id: 'math-expressions',
    title: '数字 - 数式練習',
    content: [
      '1+1=2\n',
      '5-3=2\n',
      '4*6=24\n',
      '10/2=5\n',
      '15+25=40\n',
      '100-45=55\n',
      '12*8=96\n',
      '72/9=8\n',
      '(3+5)*2=16\n',
      '20/(4+1)=4\n',
      '7*7+1=50\n',
      '100/10-5=5\n',
      '25%7=4\n',
      '2^8=256\n',
      '9!=362880\n'
    ],
    difficulty: 'normal'
  },
  {
    id: 'numbers-advanced',
    title: '数字 - 高度な数式',
    content: [
      '3.14159265\n',
      '2.71828182\n',
      '1.41421356\n',
      '0.577215664\n',
      '123.456.789\n',
      '1,234,567,890\n',
      '$1,234.56\n',
      '¥10,000\n',
      '50%\n',
      '1/2=0.5\n',
      '3/4=0.75\n',
      '5.5*2.2=12.1\n',
      '9.99+0.01=10\n',
      '(100-25)*3=225\n',
      '2020-12-31\n'
    ],
    difficulty: 'hard'
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
  },

  // ============ 日時練習 ============
  {
    id: 'datetime-time',
    title: '日時 - 時刻',
    content: [
      'am 12:00\n',
      'pm 3:30\n',
      '23:38\n',
      '15:45\n',
      '08:30\n',
      'am 9:15\n',
      'pm 6:45\n',
      '12:00~13:00\n',
      '9:00~17:00\n',
      '10:30~12:00\n',
      '14:00~15:30\n',
      'am 8:00\n',
      'pm 11:20\n',
      '19:20\n',
      '00:15\n',
      '8:45~10:15\n',
      '13:30~16:00\n',
      'am 7:30\n',
      'pm 1:45\n',
      '17:50\n'
    ],
    difficulty: 'easy'
  },
  {
    id: 'datetime-date-time',
    title: '日時 - 日付・日時',
    content: [
      '2025/12/27\n',
      '2026/01/15\n',
      '2024/03/08\n',
      '2025/12/27 15:30\n',
      '2026/01/15 am 9:00\n',
      '2024/03/08 pm 2:45\n',
      '2025/11/30\n',
      '2026/05/22\n',
      '2025/11/30 18:20\n',
      '2026/05/22 10:15\n',
      '2024/07/04 pm 7:30\n',
      '2025/12/27 10:00~12:00\n',
      '2026/01/15 am 9:00~pm 5:00\n',
      '2024/10/25\n',
      '2025/06/14\n',
      '2024/03/08 14:30~16:00\n',
      '2025/09/18 9:30~11:00\n',
      '2026/02/11 pm 2:00~pm 4:30\n',
      '2024/10/25 15:15~17:45\n',
      '2025/06/14 am 8:00~am 10:30\n'
    ],
    difficulty: 'normal'
  }
]
