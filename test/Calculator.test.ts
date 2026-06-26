import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Calculator } from "../src/application/Calculator";
import type { KeyToken } from '../src/domain/type';
import { CalcState } from '../src/domain/type';
import { Operation } from '../src/domain/type';
import { Config } from '../src/utility/Config';
import { InputBuffer } from '../src/domain/InputBuffer';
import { Evaluator } from '../src/domain/Evaluator';
import { NumberFormatter } from '../src/domain/NumberFormatter';
import type { IDisplay } from '../src/ui/DomDisplay';


describe("Calculator の単体テスト", () => {
  let mockDisplay: IDisplay;
  let evaluator: Evaluator;
  let formatter: NumberFormatter;
  let inputBuffer: InputBuffer;
  let calculator: Calculator;

  beforeEach(() => {
    mockDisplay = {
      render: vi.fn(),
      renderHistory: vi.fn(),
      renderError: vi.fn(),
    };

    inputBuffer = new InputBuffer("", Config.MAX_DIGITS);
    evaluator = new Evaluator();
    formatter = new NumberFormatter(Config.MAX_DIGITS);

    calculator = new Calculator(
      CalcState.Ready,
      null,
      null,
      inputBuffer,
      evaluator,
      formatter,
      mockDisplay
    )
  });



  // =========================
  // handle(入力ボタンの種類に応じたメソッドの呼び出し)
  // =========================

  describe("handle", () => {
    it("digitケースの場合、handleDigitが呼び出され画面が更新される", () => {
      //「5」が押下された場合、handleDigitが呼び出され、画面に「5」が表示される
      const token: KeyToken = { kind: "digit", value: 5 };
      calculator.handle(token);
      expect(mockDisplay.render).toHaveBeenCalledWith("5");
    });

    it("decimalケースの場合、handleDecimalPointが呼び出され画面が更新される", () => {

      const token: KeyToken = { kind: "decimal" };
      calculator.handle(token);
      expect(mockDisplay.render).toHaveBeenCalledWith("0.");
    });

    it("opケースの場合、handleOperatorが呼び出される", () => {
      //事前に「9」が入力されている状態をつくる
      const firstBuffer = new InputBuffer("9", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingFirst, // ⭐ここをInputtingFirstにする
        null,
        null,
        firstBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //演算子「+」が選択された場合、handleOperatorが呼び出され画面に「9+」が表示される
      const token: KeyToken = { kind: "op", value: Operation.ADD };
      customCalculator.handle(token);
      expect(mockDisplay.render).toHaveBeenCalledWith("9");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("9+");
    });

    it("equalケースの場合、handleEqualが呼び出される", () => {
      //事前に、イコールボタンが作動する状態にしておく（10 + 5 まで入力された状態）
      const customCalculator = new Calculator(
        CalcState.InputtingSecond,
        10,
        Operation.ADD,
        new InputBuffer("5", Config.MAX_DIGITS),
        evaluator,
        formatter,
        mockDisplay
      );

      //イコールボタンが押下でhandleEqualが呼び出され、10 + 5 = 15 の結果が表示される
      const token: KeyToken = { kind: "equal" };
      customCalculator.handle(token);
      expect(mockDisplay.render).toHaveBeenCalledWith("15");
    });

    it("clearケースの場合、hleAllClearが呼び出され画面が更新される", () => {
      //事前に「7」が入力されている状態をつくる
      inputBuffer.pushDigit(7);

      //クリアボタン押下でhandleAllClearが呼び出され、画面が「0」にクリアされる
      const token: KeyToken = { kind: "clear" };
      calculator.handle(token);
      expect(mockDisplay.render).toHaveBeenCalledWith("0");
    });
  });



  // =========================
  // handleDigit(数値ボタンの処理)
  // =========================
  describe("handleDigit", () => {
    it("Errorの場合、数字入力でエラー状態から回復し、計算を新規開始される", () => {
      //エラー状態に設定
      const customCalculator = new Calculator(
        CalcState.Error,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //「5」を入力し、エラー状態から回復・画面に「5」が表示される
      customCalculator.handleDigit(5);
      expect(mockDisplay.render).toHaveBeenCalledWith("5");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });

    it("Readyの場合、数値が入力され画面に表示される", () => {
      calculator.handleDigit(5);
      expect(mockDisplay.render).toHaveBeenCalledWith("5");
    });

    it("InputtingFirstの場合、末尾に数値が追加されて画面が表示される", () => {
      //「1」が入力されている状態に設定
      const firstBuffer = new InputBuffer("1", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingFirst,
        null,
        null,
        firstBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //「2」を入力すると、ディスプレイに「12」が表示される
      customCalculator.handleDigit(2);
      expect(mockDisplay.render).toHaveBeenCalledWith("12");
    });

    it("OperatorEnteredの場合、2つ目の数値として入力され画面が更新される", () => {
      //「1 + 」の状態に設定
      const customCalculator = new Calculator(
        CalcState.OperatorEntered,
        1,
        Operation.ADD,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //「2」を入力するとディスプレイに「2」、履歴エリアに「1 + 」が表示される
      customCalculator.handleDigit(2);
      expect(mockDisplay.render).toHaveBeenCalledWith("2");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("1+");
    });

    it("InputtingSecondの場合、末尾に数値が追加されて画面が更新される", () => {
      //「1 + 2」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingSecond,
        1,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //「3」を入力すると、画面に「23」、履歴エリアに「1 + 」が表示される
      customCalculator.handleDigit(3);
      expect(mockDisplay.render).toHaveBeenCalledWith("23");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("1+");
    })

    it("ResultShownの場合、新しい計算が行われる", () => {
      //「1 + 2 = 3」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.ResultShown,
        3,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //「4」を入力すると、履歴エリアが削除され、画面に「4」が表示される
      customCalculator.handleDigit(4);
      expect(mockDisplay.render).toHaveBeenCalledWith("4");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });
  });


  // =========================
  // handleDecimalPoint(小数点ボタンの処理)
  // =========================
  describe("handleDecimalPoint", () => {
    it("Errorの場合、小数点の入力は無視される", () => {
      //エラー状態に設定
      const customCalculator = new Calculator(
        CalcState.Error,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleDecimalPoint();
      expect(mockDisplay.render).not.toHaveBeenCalled();
    });


    it("Readyの場合、画面に「0.」が表示される", () => {
      calculator.handleDecimalPoint();
      expect(mockDisplay.render).toHaveBeenCalledWith("0.");
    });

    //InputtingFirstの場合、末尾に小数点が追加される
    it("InputtingFirstの場合、末尾に小数点が追加される", () => {
      //「1」が入力されている状態に設定
      const firstBuffer = new InputBuffer("1", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingFirst,
        null,
        null,
        firstBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //末尾に小数点が追加され、画面に「1.」が表示される
      customCalculator.handleDecimalPoint();
      expect(mockDisplay.render).toHaveBeenCalledWith("1.");
    });

    it("OperatorEnteredの場合、ステータスがInputtingSecondにかわり画面に「0.」が表示される", () => {
      //「1 + 」の状態に設定
      const customCalculator = new Calculator(
        CalcState.OperatorEntered,
        1,
        Operation.ADD,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //画面に「0.」が表示される
      customCalculator.handleDecimalPoint();
      expect(mockDisplay.render).toHaveBeenCalledWith("0.");
    });

    it("InputtingSecondの場合、末尾に小数点が追加される", () => {
      //「1 + 2」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingSecond,
        1,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //2つ目の数値の末尾に小数点が追加され、画面に「2.」が表示される
      customCalculator.handleDecimalPoint();
      expect(mockDisplay.render).toHaveBeenCalledWith("2.");
    });

    it("ResultShownの場合、バッファがクリアされ、新たに「0.」が表示される", () => {
      //「1 + 2 = 3」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.ResultShown,
        3,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //小数点を入力すると、画面に「0.」が表示される
      customCalculator.handleDecimalPoint();
      expect(mockDisplay.render).toHaveBeenCalledWith("0.");
    });
  });


  // =========================
  // handleOperator(演算子ボタンの処理)
  // =========================
  describe("handleOperator", () => {
    it("Errorの場合、「-」以外の演算子の入力は無視される", () => {
      //エラー状態に設定
      const customCalculator = new Calculator(
        CalcState.Error,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleOperator(Operation.ADD);
      expect(mockDisplay.render).not.toHaveBeenCalled();
      expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
    });

    it("Errorの場合、「-」はマイナス符号として入力されエラーから回復する", () => {
      //エラー状態に設定
      const customCalculator = new Calculator(
        CalcState.Error,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //画面に「-」が表示される
      customCalculator.handleOperator(Operation.SUBTRACT);
      expect(mockDisplay.render).toHaveBeenCalledWith("-");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });

    it("Readyの場合で「-」以外が押された場合、入力は無視される", () => {
      //Ready状態に設定
      const customCalculator = new Calculator(
        CalcState.Ready,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleOperator(Operation.ADD);
      expect(mockDisplay.render).not.toHaveBeenCalled();
      expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
    });

    it("Readyの場合で「-」が押された場合、マイナス符号として入力される", () => {
      //Ready状態に設定
      const customCalculator = new Calculator(
        CalcState.Ready,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );
      //画面に「-」が表示される
      customCalculator.handleOperator(Operation.SUBTRACT);
      expect(mockDisplay.render).toHaveBeenCalledWith("-");
    });

    it("InputtingFirstの場合、演算子が入力され、画面が更新される", () => {
      //「1」が入力されている状態に設定
      const firstBuffer = new InputBuffer("1", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingFirst,
        null,
        null,
        firstBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //演算子が入力され、履歴エリアに「1 + 」が表示される
      customCalculator.handleOperator(Operation.ADD);
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("1+");
    });

    it("OperatorEnteredの場合、演算子は上書きされる", () => {
      //「3 + 」の状態に設定
      const customCalculator = new Calculator(
        CalcState.OperatorEntered,
        3,
        Operation.ADD,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleOperator(Operation.DIVIDE);
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("3÷");
    });

    //
    it("InputtingSecondの場合、そこまでの計算が行われ演算子の入力も許可される", () => {
      //「1 + 2」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingSecond,
        1,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleOperator(Operation.MULTIPLY);
      expect(mockDisplay.render).toHaveBeenCalledWith("3");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("3×");
    });

    it("ResultShownの場合、演算子の入力が許可され、画面が更新される", () => {
      //「1 + 2 = 3」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.ResultShown,
        3,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleOperator(Operation.DIVIDE);
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("3÷");
    });
  });


  // =========================
  // handleEqual(イコールボタンの処理)
  // =========================
  describe("handleEqual", () => {
    it("Errorの場合、イコールボタンの入力は無視される", () => {
      //エラー状態に設定
      const customCalculator = new Calculator(
        CalcState.Error,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleEqual();
      expect(mockDisplay.render).not.toHaveBeenCalled();
      expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
    });

    it("Readyの場合、イコールボタンの入力は無視される", () => {
      //Ready状態に設定
      const customCalculator = new Calculator(
        CalcState.Ready,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleEqual();
      expect(mockDisplay.render).not.toHaveBeenCalled();
      expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
    });

    it("InputtingFirstの場合、イコールボタンの入力は無視される", () => {
      //「1」が入力されている状態に設定
      const firstBuffer = new InputBuffer("1", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingFirst,
        null,
        null,
        firstBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleEqual();
      expect(mockDisplay.render).not.toHaveBeenCalled();
      expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
    });

    it("OperatorEnteredの場合、イコールボタンの入力は無視される", () => {
      //「3 + 」の状態に設定
      const customCalculator = new Calculator(
        CalcState.OperatorEntered,
        3,
        Operation.ADD,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleEqual();
      expect(mockDisplay.render).not.toHaveBeenCalled();
      expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
    });

    it("InputtingSecondの場合、計算が実行され画面が更新される", () => {
      //「1 + 2」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingSecond,
        1,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      //イコールボタンで計算が実行され画面に計算結果が表示される
      customCalculator.handleEqual();
      expect(mockDisplay.render).toHaveBeenCalledWith("3");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("1+2 =");
    });

    it("InputtingSecondで0での割り算を行った場合、「Error」が表示される", () => {
      const zeroBuffer = new InputBuffer("0", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingSecond,
        6,
        Operation.DIVIDE,
        zeroBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleEqual();
      expect(mockDisplay.renderError).toHaveBeenCalledWith("Error");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("6÷0 =");
    })

    it("ResultShownの場合、イコールボタンの入力は無視される", () => {
      //「1 + 2 = 3」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.ResultShown,
        3,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleEqual();
      expect(mockDisplay.render).not.toHaveBeenCalled();
      expect(mockDisplay.renderHistory).not.toHaveBeenCalled();
    });
  });


  // =========================
  // handleAllClear(クリアボタンの処理)
  // =========================
  describe("handleAllClear", () => {
    it("Errorの場合、エラーから回復し画面が初期化される", () => {
      //エラー状態に設定
      const customCalculator = new Calculator(
        CalcState.Error,
        null,
        null,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleAllClear();
      expect(mockDisplay.render).toHaveBeenCalledWith("0");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });

    it("InputtingFirstの場合、画面が初期化される", () => {
      //「1」が入力されている状態に設定
      const firstBuffer = new InputBuffer("1", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingFirst,
        null,
        null,
        firstBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleAllClear();
      expect(mockDisplay.render).toHaveBeenCalledWith("0");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });

    it("OperatorEnteredの場合、画面が初期化される", () => {
      //「3 + 」の状態に設定
      const customCalculator = new Calculator(
        CalcState.OperatorEntered,
        3,
        Operation.ADD,
        inputBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleAllClear();
      expect(mockDisplay.render).toHaveBeenCalledWith("0");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });

    it("InputtingSecondの場合、画面が初期化される", () => {
      //「1 + 2」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.InputtingSecond,
        1,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleAllClear();
      expect(mockDisplay.render).toHaveBeenCalledWith("0");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });

    it("ResultShownの場合、画面が初期化される", () => {
      //「1 + 2 = 3」の状態に設定
      const customBuffer = new InputBuffer("2", Config.MAX_DIGITS);
      const customCalculator = new Calculator(
        CalcState.ResultShown,
        3,
        Operation.ADD,
        customBuffer,
        evaluator,
        formatter,
        mockDisplay
      );

      customCalculator.handleAllClear();
      expect(mockDisplay.render).toHaveBeenCalledWith("0");
      expect(mockDisplay.renderHistory).toHaveBeenCalledWith("");
    });
  });
});