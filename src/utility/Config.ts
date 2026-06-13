/**
 * 設定情報
 */
export class Config {
  //最大桁数
  static readonly MAX_DIGITS = 8;

  //エラーメッセージの設定
  static readonly ERROR_MESSAGE = {
    MAX_DIGITS: "最大桁数超過エラー",
    EMPTY_INPUT: "数値未入力のため入力不可",
    DIVIDE_BY_ZERO: "0で割ることはできません",
    NOT_ALLOWED_INPUT: "入力不可",
    // UNEXPECTED_ERROR: "想定外のエラー"
  } as const;
}