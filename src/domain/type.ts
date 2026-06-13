/**
 * 演算子の型定義
 */
export enum Operation {
  ADD = '+',        //足し算
  SUBTRACT = '-',   //引き算
  MULTIPLY = '×',   //掛け算
  DIVIDE = '÷',     //割り算
}

/**
 * 入力ボタンの種類を判別するための型
 */
export type KeyToken =
  | { kind: "digit"; value: number }  //数字ボタン(0~9)
  | { kind: "decimal" }               //小数点ボタン
  | { kind: "op"; value: Operation }  //演算子ボタン(+,-,*,/)
  | { kind: "equal" }                 //イコールボタン
  | { kind: "clear" };                //クリアボタン

/**
 * ステータスの定義
 */
export enum CalcState {
  Ready, // 初期状態
  InputtingFirst, // 1つ目の数値入力中
  OperatorEntered, // 演算子入力完了
  InputtingSecond, // 2つ目の数値入力中
  ResultShown, // 「=」が押され、計算結果を表示している状態
  Error, // エラー状態
}

