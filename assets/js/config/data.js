// ==== ゲーム設定 ====
export const GAME_SPEEDS = [1000, 500, 100];   // x1, x2, x3
export const HISTORY_LENGTH = 60;               // チャート履歴日数

// ==== 銘柄データ ====
// id, name, sector, 初期価格, 年期待リターン, 年ボラティリティ, マクロ感度, 業績スコア
export const COMPANY_DATA = [
  ["TECH", "TechNova Systems",   "IT・通信",   3200, 0.09, 0.22, 0.6, 0.2],
  ["BANK", "Global Central Bank","金融",       1500, 0.06, 0.15, 0.5, 0.1],
  ["AUTO", "AutoFuture Motors",  "自動車",     2400, 0.07, 0.18, 0.5, 0.0],
  ["ENRG", "EcoEnergy Corp",    "エネルギー", 1800, 0.07, 0.25, 0.7,-0.1],
  ["HEAL", "BioHealth Pharma",  "ヘルスケア", 4500, 0.10, 0.30, 0.6, 0.3],
  ["AIR",  "Sky Airlines",      "運輸",       1200, 0.05, 0.20, 0.5,-0.2],
  ["FOOD", "Daily FoodLife",    "食品",        800, 0.04, 0.12, 0.4, 0.0],
  ["BLD",  "BuildPro Const.",   "建設",      2100, 0.05, 0.16, 0.5,-0.1]
];

// ==== ニュース定義 ====
export const NEWS_EVENTS = [
  { text: "政府が大規模な金融緩和策を発表。市場全体に好感。", target: "ALL", effect: 0.08, isGood: true },
  { text: "中央銀行が予想外の利上げに踏み切る。警戒感広がる。", target: "ALL", effect: -0.06, isGood: false },
  { text: "次世代AI技術のブレイクスルー。ITセクターに買い注文殺到。", target: "TECH", effect: 0.15, isGood: true },
  { text: "Global Central Bank、過去最高の四半期利益を報告。", target: "BANK", effect: 0.10, isGood: true },
  { text: "中東での地政学リスク高まる。原油価格が急騰。", target: "ENRG", effect: 0.12, isGood: true },
  { text: "中東での地政学リスク高まる。燃料費高騰懸念で航空株下落。", target: "AIR", effect: -0.10, isGood: false },
  { text: "BioHealth社、画期的な新薬の臨床試験に成功。", target: "HEAL", effect: 0.18, isGood: true },
  { text: "AutoFuture社、大規模なリコールを発表。業績懸念。", target: "AUTO", effect: -0.15, isGood: false },
  { text: "大規模なインフラ整備法案が可決。建設需要増の期待。", target: "BLD", effect: 0.09, isGood: true },
  { text: "異常気象による不作懸念。食品セクターのコスト増。", target: "FOOD", effect: -0.08, isGood: false },
  { text: "未知の感染症の噂。渡航制限への懸念から航空株急落。", target: "AIR", effect: -0.15, isGood: false },
  { text: "未知の感染症の噂。医療・医薬セクターに資金流入。", target: "HEAL", effect: 0.12, isGood: true }
];