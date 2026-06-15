import { Config } from "./utility/Config";
import { CalcState } from "./domain/type";
import { Calculator } from "./application/Calculator";
import { Evaluator } from "./domain/Evaluator";
import { InputBuffer } from "./domain/InputBuffer";
import { KeyMapper } from "./ui/KeyMapper";
import { DomDisplay } from "./ui/DomDisplay";
import { NumberFormatter } from "./domain/NumberFormatter";


//DOM取得
const displayElement = document.getElementById("display");
const historyElement = document.getElementById("history");

// DOM取得エラーチェック
if (!displayElement || !historyElement) {
  throw new Error("HTMLに id='display' または id='history' の要素が見つかりません。");
}

// インスタンスの生成
const domDisplay = new DomDisplay(displayElement, historyElement);
const inputBuffer = new InputBuffer("", Config.MAX_DIGITS);
const evaluator = new Evaluator();
const formatter = new NumberFormatter(Config.MAX_DIGITS);
const mapper = new KeyMapper();
const calculator = new Calculator(
  CalcState.Ready,
  null,
  null,
  inputBuffer,
  evaluator,
  formatter,
  domDisplay
);


// .keysの中にあるbuttonに対してクリックイベントを設定
document.querySelectorAll(".keys button").forEach(btn => {
  btn.addEventListener("click", e => {
    const token = mapper.resolve(e.target as HTMLElement);
    if (token) {
      calculator.handle(token);
    }
  });
});