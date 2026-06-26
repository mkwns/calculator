import { describe, it, expect } from 'vitest';
import { NumberFormatter } from '../src/domain/NumberFormatter';
import { Config } from '../src/utility/Config';

const formatter = new NumberFormatter(Config.MAX_DIGITS);

// =========================
// formatForDisplay(計算結果の数値をディスプレイ表示用の文字列に変換)
// =========================
describe("formatForDisplay", () => {
  it("最大桁数以内の通常の整数はそのまま文字列に変換される", () => {
    expect(formatter.formatForDisplay(123)).toBe("123");
    expect(formatter.formatForDisplay(0)).toBe("0");
    expect(formatter.formatForDisplay(-45)).toBe("-45");
  });

  it("最大桁数を超える場合、指数表記で表示される", () => {
    expect(formatter.formatForDisplay(-123456780)).toBe("-1.2345678e+8");
  })

  it("末尾に不要な0や小数点があれば削除される", () => {
    expect(formatter.formatForDisplay(123.0)).toBe("123");
    expect(formatter.formatForDisplay(123.)).toBe("123");
  });
});


// =========================
// fits(電卓で表示可能な範囲かの判定)
// =========================
describe("fits", () => {
  it("通常の整数や小数の場合、true", () => {
    expect(formatter.fits(123)).toBe(true);
    expect(formatter.fits(0)).toBe(true);
    expect(formatter.fits(-45.67)).toBe(true);
  });

  it("値がInfinityの場合、false", () => {
    expect(formatter.fits(Infinity)).toBe(false);
    expect(formatter.fits(-Infinity)).toBe(false);
  });

  it("値が NaN (非数) の場合、false", () => {
    expect(formatter.fits(NaN)).toBe(false);
  });
});