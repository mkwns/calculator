import type { KeyToken } from "../domain/type";
import { CalcState } from "../domain/type";
import { Operation } from "../domain/type";
import { Config } from "../utility/Config";
import { InputBuffer } from "../domain/InputBuffer";
import { Evaluator } from "../domain/Evaluator";
import { NumberFormatter } from "../domain/NumberFormatter";
import type { IDisplay } from "../ui/DomDisplay";
import { DivisionByZeroError } from "../utility/error";

/**
 * アプリケーション制御のクラス
 */
export class Calculator {
  constructor(
    private state: CalcState,
    private left: number | null,
    private operator: Operation | null,
    private buffer: InputBuffer,
    private evaluator: Evaluator,
    private formatter: NumberFormatter,
    private display: IDisplay
  ) { }


  /**
   * 入力ボタンの種類に応じて、司令塔の適切なメソッドを呼び出す
   * @param token 引数：入力されたボタンの種類
   */
  public handle(token: KeyToken): void {
    switch (token.kind) {
      case "digit":
        this.handleDigit(token.value);
        break;

      case "decimal":
        this.handleDecimalPoint();
        break;

      case "op":
        this.handleOperator(token.value);
        break;

      case "equal":
        this.handleEqual();
        break;

      case "clear":
        this.handleAllClear();
        break;
    }
  }


  /**
   * 数値(0~9)のボタンが押された時の各ステータスごとの処理
   * @param d 引数：押下された数値ボタンの値
   */
  public handleDigit(d: number): void {
    // エラー状態の場合、数字入力で新規開始
    if (this.state === CalcState.Error) {
      this.state = CalcState.InputtingFirst;
      this.buffer.pushDigit(d);
      this.buffer.getBufferString();
      this.display.render(this.buffer.getBufferString());
      this.display.renderHistory("");
      return;
    }

    // 通常の場合
    switch (this.state) {
      // 初期状態
      case CalcState.Ready:
        this.state = CalcState.InputtingFirst;
        this.buffer.pushDigit(d);
        break;

      // 1つ目の数値入力中
      case CalcState.InputtingFirst:
        this.buffer.pushDigit(d);
        break;

      // 演算子入力完了
      case CalcState.OperatorEntered:
        this.state = CalcState.InputtingSecond;
        this.buffer.pushDigit(d);
        this.display.renderHistory(this.formatter.formatForDisplay(this.left!) + this.operator);
        break;

      // 2つ目の数値入力中
      case CalcState.InputtingSecond:
        this.buffer.pushDigit(d);
        this.display.renderHistory(this.formatter.formatForDisplay(this.left!) + this.operator);
        break;

      // 「=」が押され、計算結果を表示している状態
      case CalcState.ResultShown:
        this.buffer.clear();
        this.state = CalcState.InputtingFirst;
        this.buffer.pushDigit(d);
        this.display.renderHistory("");
        break;
    }
    this.display.render(this.buffer.getBufferString());
  }


  /**
   * 小数点ボタンが押された時の各ステータスごとの処理
   */
  public handleDecimalPoint(): void {
    // エラー状態の場合
    if (this.state === CalcState.Error) {
      return;
    }

    // 通常の場合
    switch (this.state) {
      // 初期状態
      case CalcState.Ready:
        this.state = CalcState.InputtingFirst;
        this.buffer.pushDecimal();
        break;

      // 1つ目の数値入力中
      case CalcState.InputtingFirst:
        this.buffer.pushDecimal();
        break;

      // 演算子入力完了
      case CalcState.OperatorEntered:
        this.state = CalcState.InputtingSecond;
        this.buffer.pushDecimal();
        break;

      // 2つ目の数値入力中
      case CalcState.InputtingSecond:
        this.buffer.pushDecimal();
        break;

      // 「=」が押され、計算結果を表示している状態
      case CalcState.ResultShown:
        this.buffer.clear();
        this.state = CalcState.InputtingFirst;
        this.buffer.pushDecimal();
        break;
    }
    this.display.render(this.buffer.getBufferString());
  }

  /**
   * 演算子ボタンが押された時の各ステータスごとの処理
   * @param op 引数：押下された演算子ボタンの値
   */
  public handleOperator(op: Operation): void {
    // エラー状態の場合
    if (this.state === CalcState.Error) {
      // 「-」はマイナス符号として入力
      if (op === Operation.SUBTRACT) {
        this.state = CalcState.Ready;
        this.buffer.pushMinus();
        this.display.render(this.buffer.getBufferString());
        this.display.renderHistory("");
      }
      //「-」以外の入力は無視
      return;
    }

    // 通常の場合
    switch (this.state) {
      // 初期状態
      case CalcState.Ready:
        // 「-」はマイナス符号として入力を許可
        if (op === Operation.SUBTRACT) {
          this.buffer.pushMinus();
          this.display.render(this.buffer.getBufferString());
        }
        break;


      // 1つ目の数値入力中
      case CalcState.InputtingFirst:
        this.left = this.buffer.toNumber();// バッファの数値をleftに保存
        this.buffer.clear();
        this.operator = op;
        this.state = CalcState.OperatorEntered;

        this.display.render(this.formatter.formatForDisplay(this.left));
        this.display.renderHistory(this.formatter.formatForDisplay(this.left) + this.operator);
        break;

      // 演算子入力完了
      case CalcState.OperatorEntered:
        // 既に演算子入力済みの場合、直前の演算子を上書き
        this.operator = op;
        this.display.renderHistory(this.formatter.formatForDisplay(this.left!) + this.operator);
        break;

      // 2つ目の数値入力中
      case CalcState.InputtingSecond:
        //計算を実施し、結果をleftに保存
        if (this.left !== null && this.operator !== null) {
          const right = this.buffer.toNumber();

          try {
            this.left = this.evaluator.compute(this.left, this.operator, right);
            this.operator = op;
            this.buffer.clear();
            this.state = CalcState.OperatorEntered;

            //計算結果を履歴エリアに表示
            this.display.render(this.formatter.formatForDisplay(this.left));
            this.display.renderHistory(this.formatter.formatForDisplay(this.left) + this.operator);

          } catch (error) {
            // 0徐算の場合 
            if (error instanceof DivisionByZeroError) {
              console.error(`[0徐算エラー] ${Config.ERROR_MESSAGE.DIVIDE_BY_ZERO}`);
            }
            this.display.renderError("Error");
            this.state = CalcState.Error;
            this.buffer.clear();
          }
        }
        break;

      // 「=」が押され、計算結果を表示している状態
      case CalcState.ResultShown:
        this.operator = op;
        this.state = CalcState.OperatorEntered;
        this.display.render(this.formatter.formatForDisplay(this.left!));
        this.display.renderHistory(this.formatter.formatForDisplay(this.left!) + this.operator);
        break;
    }
  }

  /**
   * イコールボタンが押された時の各ステータスごとの処理
   */
  public handleEqual(): void {
    // エラー状態の場合
    if (this.state === CalcState.Error) {
      return;
    }

    // 通常の場合
    switch (this.state) {
      // 初期状態・1つ目の数値入力中・演算子入力完了・計算結果表示中の場合
      case CalcState.Ready:
      case CalcState.InputtingFirst:
      case CalcState.OperatorEntered:
      case CalcState.ResultShown:
        //処理なし
        break;

      // 2つ目の数値入力中の場合
      case CalcState.InputtingSecond:
        //leftか演算子がnullの場合計算は実行されない
        if (this.left === null || this.operator === null) {
          return;
        }
        const right = this.buffer.toNumber();
        try {
          const result = this.evaluator.compute(this.left, this.operator, right);

          //ディスプレイ表示
          this.display.render(this.formatter.formatForDisplay(result));
          this.display.renderHistory(`${this.formatter.formatForDisplay(this.left)}${this.operator}${this.formatter.formatForDisplay(right)} =`);

          this.left = result;
          this.operator = null;
          this.buffer.clear();
          this.state = CalcState.ResultShown;

        } catch (error) {
          if (error instanceof DivisionByZeroError) {
            console.error(`[0徐算エラー] ${Config.ERROR_MESSAGE.DIVIDE_BY_ZERO}`);
          }
          this.display.renderError("Error");
          this.display.renderHistory(`${this.formatter.formatForDisplay(this.left)}${this.operator}${this.formatter.formatForDisplay(right)} =`);
          this.state = CalcState.Error;
          this.buffer.clear();
        }
    }
  }

  /**
   * 入力クリア
   * 現在入力中の数値をクリア
   */
  public handleClear(): void {
    this.buffer.clear();
    this.display.render("0");
  }


  /**
   * 全消去
   */
  public handleAllClear(): void {
    // エラーからの回復
    if (this.state === CalcState.Error) {
      this.left = null;
      this.operator = null;
      this.buffer.clear();
      this.display.render("0");
      this.display.renderHistory("");
      this.state = CalcState.Ready;
      return;
    }

    // 通常のクリア処理
    this.buffer.clear();
    this.left = null;
    this.operator = null;
    this.display.render("0");
    this.display.renderHistory("");
    this.state = CalcState.Ready;
  }

  /**
   * バックスペース（1文字削除）
   */
  public handleBackspace(): void {
    // エラー、文字が未入力状態（Ready, OperatorEntered, ResultShown）の場合処理なし
    if (
      this.state === CalcState.Error ||
      this.state === CalcState.Ready ||
      this.state === CalcState.OperatorEntered ||
      this.state === CalcState.ResultShown
    ) {
      return;
    }

    // バッファから1文字削除
    this.buffer.backspace();

    // 画面の表示の更新
    this.display.render(this.buffer.getBufferString());

    // 2つ目の数値を入力中の場合、履歴エリアの表示の更新
    if (this.state === CalcState.InputtingSecond) {
      this.display.renderHistory(
        this.formatter.formatForDisplay(this.left!) + this.operator + this.buffer.getBufferString()
      );
    }
  }
}