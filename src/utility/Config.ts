/**
 * 設定情報
 */
export class Config {
  //最大桁数
  static readonly MAX_DIGITS = 8;

  //エラーメッセージの設定
  static readonly ERROR_MESSAGE = {
    MAX_DIGITS: `入力できるのは最大${this.MAX_DIGITS}桁までです`,
    EMPTY_INPUT: "数値を入力してください",
    DIVIDE_BY_ZERO: "0で割ることはできません",
    NOT_ALLOWED_INPUT: "無効な入力操作です",
  } as const;
}