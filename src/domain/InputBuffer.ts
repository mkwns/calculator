import { Config } from "../utility/Config";


/**
 * オペランド文字列の管理
 * 桁数上限（合計8桁）を超える入力を拒否（追加を無視）。
 * 桁数は value から . と - を除いた文字数で算出。
 */
export class InputBuffer {
  constructor(private value: string, private readonly maxDigits: number) { }

  /**
   * バッファの末尾に数字を追加
   * @param d 引数：追加する数字(0~9)
   */
  public pushDigit(d: number): void {
    //1. 最大桁数を超える場合、入力は無視
    if (this.digitCount() >= this.maxDigits) {
      //処理なし
      console.error(`[入力エラー]${Config.ERROR_MESSAGE.MAX_DIGITS}`);
      return;
    }

    //2. 「0」のみが入力されている状態の場合
    if (this.value === "0") {
      //「0」の次に連続して「0」の入力不可（「00」はNG）
      if (d === 0) {
        console.error(`[入力エラー]${Config.ERROR_MESSAGE.NOT_ALLOWED_INPUT}`);
        return;
      }
      //「1-9」が入力された場合、「0」を消して上書き
      this.value = d.toString();
      return;
    }

    //3. 通常の追加（最大桁数未満の場合、数字を追加する）
    this.value += d.toString();
  }


  /**
   * バッファの末尾に小数点の追加
   */
  public pushDecimal(): void {
    //1. 小数点が既に入力済み、マイナス符号のみ、または最大桁数超過の場合は入力を無視
    if (this.digitCount() >= this.maxDigits) {
      console.error(`[入力エラー]${Config.ERROR_MESSAGE.MAX_DIGITS}`);
      return;
    }
    else if (this.value.includes(".") || this.value === "-") {
      console.error(`[入力エラー]${Config.ERROR_MESSAGE.NOT_ALLOWED_INPUT}`);
      return;
    }

    //2. 何も入力がされていない場合は「0.」とし、それ以外は末尾に「.」を追加（通常入力）
    if (this.isEmpty()) {
      this.value = "0.";
    }
    else {
      this.value += ".";
    }
  }


  /**
   * バッファにマイナス符号の追加
   */
  public pushMinus(): void {
    // バッファに何も入力されていない場合マイナス符号を追加
    if (this.isEmpty()) {
      this.value = "-";
    }
  }

  /**
   * 現在バッファに保持されている桁数の確認
   * @returns 戻り値：マイナス記号と小数点を除いた数字の桁数
   */
  public digitCount(): number {
    //"." "-" 以外の文字数を取得
    return this.value.replace(/[.-]/g, "").length;
  }

  /**
   * バッファに保持されている文字列を数値に変換
   * @returns 戻り値：変換後の数値
   */
  public toNumber(): number {
    return Number(this.value);
  }

  /**
   * バッファに保持されている文字列を完全にクリア
   */
  public clear(): void {
    this.value = "";
  }

  /**
   * バッファの末尾から1文字削除する
   */
  public backspace(): void {
    // すでに空の場合処理なし
    if (this.isEmpty()) {
      return;
    }

    // 末尾の1文字を削除
    this.value = this.value.slice(0, -1);

    // "-" だけが残った場合、マイナス符号も削除
    if (this.value === "-") {
      this.value = "";
    }
  }

  /**
   * バッファの中身が空（何も入力されていない）かの判定
   * @returns 戻り値：空の場合はtrue、何か入力されている場合false
   */
  public isEmpty(): boolean {
    return this.value.length === 0;
  }
}
