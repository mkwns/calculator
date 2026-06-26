import { describe, it, expect } from 'vitest';
import { InputBuffer } from '../src/domain/InputBuffer';
import { Config } from '../src/utility/Config';


// =========================
// pushDigit(数値の追加)
// =========================
describe("pushDigit", () => {
  it("最大桁数を超える場合、入力は無視", () => {
    const buffer = new InputBuffer("12345678", Config.MAX_DIGITS);
    buffer.pushDigit(9);
    expect(buffer.getBufferString()).toBe("12345678");
  });

  it("現在の数値が「0」の場合、「0」の連続入力不可", () => {
    const buffer = new InputBuffer("0", Config.MAX_DIGITS);
    buffer.pushDigit(0);
    expect(buffer.getBufferString()).toBe("0");
  });

  it("現在の数値が「0」で「1-9」が入力された場合、「0」を消して上書き", () => {
    const buffer = new InputBuffer("0", Config.MAX_DIGITS);
    buffer.pushDigit(1);
    expect(buffer.getBufferString()).toBe("1");
  });

  it("既に数値(1~9のいずれか)が入力されている場合、末尾に数値を追加", () => {
    const buffer = new InputBuffer("1", Config.MAX_DIGITS);
    buffer.pushDigit(2);
    expect(buffer.getBufferString()).toBe("12");
  });
});


// =========================
// pushDecimal(小数点の追加)
// =========================
describe("pushDecimal", () => {
  it("小数点が既に入力済みの場合、入力を無視", () => {
    const buffer = new InputBuffer("1.5", Config.MAX_DIGITS);
    buffer.pushDecimal();
    expect(buffer.getBufferString()).toBe("1.5");
  });

  it("小数点の連続で押下された場合、入力を無視", () => {
    const buffer = new InputBuffer("1.", Config.MAX_DIGITS);
    buffer.pushDecimal();
    expect(buffer.getBufferString()).toBe("1.");
  });

  it("現在の数値がマイナス符号のみの場合、入力を無視", () => {
    const buffer = new InputBuffer("-", Config.MAX_DIGITS);
    buffer.pushDecimal();
    expect(buffer.getBufferString()).toBe("-");
  });

  it("最大桁数まで既に入力されている場合、入力を無視", () => {
    const buffer = new InputBuffer("12345678", Config.MAX_DIGITS);
    buffer.pushDecimal();
    expect(buffer.getBufferString()).toBe("12345678");
  });

  it("何も入力されていない場合、「0.」とする", () => {
    const buffer = new InputBuffer("", Config.MAX_DIGITS);
    buffer.pushDecimal();
    expect(buffer.getBufferString()).toBe("0.");
  });

  it("既に数値が入力されいる場合、末尾に小数点を追加", () => {
    const buffer = new InputBuffer("1", Config.MAX_DIGITS);
    buffer.pushDecimal();
    expect(buffer.getBufferString()).toBe("1.");
  });
});


// =========================
// pushMinus(マイナス符号の追加)
// =========================
describe("pushMinus", () => {
  it("バッファに何も入力されていない場合、マイナス符号を追加", () => {
    const buffer = new InputBuffer("", Config.MAX_DIGITS);
    buffer.pushMinus();
    expect(buffer.getBufferString()).toBe("-");
  });

  it("既に数値が入力済みの場合、入力を無視", () => {
    const buffer = new InputBuffer("1", Config.MAX_DIGITS);
    buffer.pushMinus();
    expect(buffer.getBufferString()).toBe("1");
  });
});


// =========================
// digitCount
// =========================
describe("digitCount", () => {
  it("バッファに保持されている文字数を取得(「.」「-」を除く)", () => {
    const buffer = new InputBuffer("-1.234", Config.MAX_DIGITS);
    expect(buffer.digitCount()).toBe(4);
  });
});



// =========================
// toNumber
// =========================
describe("toNumber", () => {
  it("バッファに保持されている文字列を数値に変換", () => {
    const buffer = new InputBuffer("-1.234", Config.MAX_DIGITS);
    expect(buffer.toNumber()).toBe(-1.234);
  });
});


// =========================
// clear
// =========================
describe("clear", () => {
  it("バッファが保持している文字列をクリア", () => {
    const buffer = new InputBuffer("123", Config.MAX_DIGITS);
    buffer.clear();
    expect(buffer.isEmpty()).toBe(true);
  });
});


// =========================
// isEmpty
// =========================
describe("isEmpty", () => {
  it("バッファに何も入力されていない場合、true", () => {
    const buffer = new InputBuffer("", Config.MAX_DIGITS);
    expect(buffer.isEmpty()).toBe(true);
  });

  it("バッファに何か入力されている場合、false", () => {
    const buffer = new InputBuffer("1", Config.MAX_DIGITS);
    expect(buffer.isEmpty()).toBe(false);
  });
});



// =========================
// getBufferString
// =========================
describe("getBufferString", () => {
  it("バッファに何も値が入っていない場合、「0」を返す", () => {
    const buffer = new InputBuffer("", Config.MAX_DIGITS);
    expect(buffer.getBufferString()).toBe("0");
  });

  it("バッファに数値が入力されている場合、文字列として取得", () => {
    const buffer = new InputBuffer("1", Config.MAX_DIGITS);
    expect(buffer.getBufferString()).toBe("1");
  });
});

