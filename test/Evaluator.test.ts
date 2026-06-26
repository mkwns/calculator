import { describe, it, expect } from 'vitest';
import { Evaluator } from '../src/domain/Evaluator';
import { DivisionByZeroError } from '../src/utility/error';
import { Operation } from '../src/domain/type';



describe("compute", () => {
  const evaluator = new Evaluator();

  // =========================
  // 加算
  // =========================

  //整数同士
  it("1 + 2 = 3", () => {
    expect(evaluator.compute(1, Operation.ADD, 2)).toBe(3);
  });

  //マイナスと整数
  it("-3 + 8 = 5", () => {
    expect(evaluator.compute(-3, Operation.ADD, 8)).toBe(5);
  });

  //結果がマイナス
  it("-5 + 2 = -3", () => {
    expect(evaluator.compute(-5, Operation.ADD, 2)).toBe(-3);
  });

  //少数同士
  it("0.1 + 0.2 = 0.3", () => {
    expect(evaluator.compute(0.1, Operation.ADD, 0.2)).toBe(0.3);
  });

  // =========================
  // 引き算
  // =========================

  //整数同士
  it("10 - 3 = 7", () => {
    expect(evaluator.compute(10, Operation.SUBTRACT, 3)).toBe(7);
  });

  //マイナスと整数
  it("-5 - 3 = -8", () => {
    expect(evaluator.compute(-5, Operation.SUBTRACT, 3)).toBe(-8);
  });

  //結果がマイナス
  it("2 - 7 = -5", () => {
    expect(evaluator.compute(2, Operation.SUBTRACT, 7)).toBe(-5);
  });

  //少数同士
  it("1.5 - 0.4 = 1.1", () => {
    expect(evaluator.compute(1.5, Operation.SUBTRACT, 0.4)).toBe(1.1);
  });


  // =========================
  // 掛け算
  // =========================

  //整数同士
  it("4 * 3 = 12", () => {
    expect(evaluator.compute(4, Operation.MULTIPLY, 3)).toBe(12);
  });

  //マイナスと整数(結果がマイナス)
  it("-4 * 3 = -12", () => {
    expect(evaluator.compute(-4, Operation.MULTIPLY, 3)).toBe(-12);
  });

  //少数同士
  it("0.2 * 0.3 = 0.06", () => {
    expect(evaluator.compute(0.2, Operation.MULTIPLY, 0.3)).toBe(0.06);
  });


  // =========================
  // 割り算
  // =========================

  //整数同士
  it("15 / 3 = 5", () => {
    expect(evaluator.compute(15, Operation.DIVIDE, 3)).toBe(5);
  });

  //マイナスと整数(結果がマイナス)
  it("-12 / 4 = -3", () => {
    expect(evaluator.compute(-12, Operation.DIVIDE, 4)).toBe(-3);
  });

  //少数同士
  it("5.5 / 2.2 = 2.5", () => {
    expect(evaluator.compute(5.5, Operation.DIVIDE, 2.2)).toBe(2.5);
  });

  //0徐算エラー
  //0での割り算はエラーを投げること
  it("5 / 0 = エラー", () => {
    expect(() => evaluator.compute(5, Operation.DIVIDE, 0)).toThrow(DivisionByZeroError);
  });


  // =========================
  // 型定義にない演算子によるコンパイルエラー
  // =========================
  it("型定義にない不正な演算子の場合コンパイルエラーになる", () => {
    // @ts-expect-error: 'UNKNOWN' は Operation 型に存在しないためエラーになるのが正しい
    expect(() => evaluator.compute(3, "UNKNOWN", 2)).toThrow(new Error("未対応の演算子：UNKNOWN"));
  })
});