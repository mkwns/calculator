import { Config } from "./Config";

/**
 * ０徐算エラー
 */
export class DivisionByZeroError extends Error {
  constructor() {
    super(Config.ERROR_MESSAGE.DIVIDE_BY_ZERO);
    this.name = "DivisionByZeroError";
  }
}