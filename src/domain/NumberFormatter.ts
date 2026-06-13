
/**
 * 計算結果の数値をディスプレイ表示用の文字列に変換・整形
 * 最大桁数を超える場合、指数表記
 */
export class NumberFormatter {
  constructor(private readonly maxDigits: number) { }

  /**
   * 計算結果の数値をディスプレイ表示用の文字列に変換・整形
   * @param a 引数：整形対象の数値(計算結果)
   * @returns 戻り値：ディスプレイ表示用に整形した文字列
   */
  public formatForDisplay(a: number): string {
    // 1. 通常表記（末尾の不要な0、小数点を削除）
    let normalString = a.toString();
    normalString = normalString
      .replace(/(\.\d+?)0+e/, "$1e")
      .replace(/\.e/, "e");

    // 2. 最大桁数(MAX_DIGITS)以内の場合、そのまま返す
    if (normalString.length <= this.maxDigits) {
      return normalString;
    }

    // 3. 最大桁数超過の場合、指数表記 
    // 9桁目を切り捨て、小数点前1桁 + 小数点後7桁で表示
    else {
      const exponentialString = Number(normalString).toExponential(7);
      return exponentialString.toString();
    }
  }

  /**
   * 電卓で表示可能な範囲かの判定
   * @param n 検証対象の数値
   * @returns 戻り値：表示可能の場合true、エラー表示にすべき場合false
   */
  public fits(n: number): boolean {
    // 無限（Infinity）や NaN（計算不能）の確認
    if (!Number.isFinite(n)) {
      return false;
    }
    return true;
  }
}

// // --- 動作確認 ---
// // インスタンスを生成（最大桁数として 8 を渡す）
// const formatter = new NumberFormatter(this.maxDigits);

// console.log("=== テスト1: 通常表記（最大桁数以内） ===");
// console.log("整数 (12345)     ➔", formatter.formatForDisplay(12345));     // 12345
// console.log("小数 (123.45)    ➔", formatter.formatForDisplay(123.45));    // 123.45
// console.log("ジャスト8桁      ➔", formatter.formatForDisplay(12345678));  // 12345678

// console.log("\n=== テスト2: 桁数オーバーによる指数表記 ===");
// // 9桁の数値を渡してみる
// console.log("9桁 (123456789)  ➔", formatter.formatForDisplay(123456789));
// // 期待される表示: 1.2345679e+8 (小数点前1桁 + 後7桁 = 合計8桁の数字 + 指数表記)

// // 巨大な数値を渡してみる
// console.log("巨大な数値       ➔", formatter.formatForDisplay(999999999999));
// // 期待される表示: 1.0000000e+12 辺り

// console.log("\n=== テスト3: 表示可能範囲のチェック (fits) ===");
// console.log("通常の数値 (100) ➔ 表示可能？:", formatter.fits(100));       // true
// console.log("計算不能 (NaN)   ➔ 表示可能？:", formatter.fits(NaN));       // false
// console.log("無限大 (Infinity)➔ 表示可能？:", formatter.fits(Infinity));  // false