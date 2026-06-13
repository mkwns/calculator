export interface IDisplay {
  render(text: string): void;
  renderHistory(text: string): void;
  renderError(message: string): void;
}


/**
 * UI 表示
 */
export class DomDisplay implements IDisplay {
  constructor(private mainEl: HTMLElement, private historyEl: HTMLElement) { }

  /**
   * メイン画面（#display）にテキストを表示
   * @param text 引数：画面に表示するテキスト
   */
  public render(text: string): void {
    this.mainEl.textContent = text;
  }


  /**
   * 履歴画面（#history）にテキストを表示
   * @param text 引数：画面に表示するテキスト
   */
  public renderHistory(text: string): void {
    this.historyEl.textContent = text;
  }

  /**
   * エラー時にメイン画面にメッセージを表示
   * @param message 引数：画面に表示するエラーメッセージ
   */
  public renderError(message: string): void {
    this.mainEl.textContent = message;
  }
}