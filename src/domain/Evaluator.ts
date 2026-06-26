import { DivisionByZeroError } from "../utility/error";
import { Operation } from "./type";

/**
 * 計算の実行
 */
export class Evaluator {
  /**
   * 四則演算の実施
   * @param a 引数①：1つ目の数値(a)
   * @param op 引数②：演算子(op)
   * @param b 引数③：2つ目の数値(b)
   * @returns 戻り値：計算結果(number型)
   */
  public compute(a: number, op: Operation, b: number): number {
    switch (op) {
      case Operation.ADD:
        return a + b;

      case Operation.SUBTRACT:
        return a - b;

      case Operation.MULTIPLY:
        return a * b;

      case Operation.DIVIDE:
        if (b === 0) {
          throw new DivisionByZeroError();
        }
        return a / b;

      default:
        // Operationで新しい演算子が追加で定義されたのに、switch文の中で処理を忘れている場合、コンパイルエラーになる
        const _exhaustiveCheck: never = op;
        throw new Error(`未対応の演算子：${_exhaustiveCheck}`);
    }
  }
}
