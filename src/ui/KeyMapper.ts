import { Operation } from "../domain/type";
import type { KeyToken } from "../domain/type";

/**
 * DOM取得したデータをKeyTokenに振り分けのクラス
 */
export class KeyMapper {
  private keyMap: Map<string, KeyToken> = new Map();

  constructor() {
    for (let i = 0; i <= 9; i++) {
      this.keyMap.set(i.toString(), { kind: "digit", value: i });
    }

    this.keyMap.set("op:.", { kind: "decimal" });
    this.keyMap.set("op:/", { kind: "op", value: Operation.DIVIDE });
    this.keyMap.set("op:*", { kind: "op", value: Operation.MULTIPLY });
    this.keyMap.set("op:-", { kind: "op", value: Operation.SUBTRACT });
    this.keyMap.set("op:+", { kind: "op", value: Operation.ADD });
    this.keyMap.set("eq", { kind: "equal" });
    this.keyMap.set("C", { kind: "clear" });
  }

  /**
   * 取得したDOM要素を対応するKeyTokenに振り分ける
   * @param target 引数：クリックイベントの発生源
   * @returns 対応するKeyToken。該当するデータがない場合はnull
   */
  public resolve(target: EventTarget): KeyToken | null {
    // target が本当に HTML 要素（HTMLElement）か安全チェック
    if (!(target instanceof HTMLElement)) {
      return null;
    }

    const buttonElement = target.closest("[data-key]");
    if (!(buttonElement instanceof HTMLElement)) {
      return null;
    }

    // HTMLの data-key の値を取得
    const dataKey = target.dataset.key;

    // data-key が無ければ翻訳できないので null を返す
    if (!dataKey) {
      return null;
    }

    // Map から対応するトークンを探して返す（なければ null）
    return this.keyMap.get(dataKey) || null;
  }

}