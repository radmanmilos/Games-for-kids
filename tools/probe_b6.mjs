import { readFileSync } from "fs";
const t = readFileSync("game/games/racing3d.mjs", "utf8").split("\n");
const show = (a, b, lab) => {
  console.log("===" + lab + "===");
  for (let i = a; i <= b && i < t.length; i++)
    console.log(String(i).padStart(4) + ": " + t[i].trim().slice(0, 120));
};
//1 exhaust anchor exL/exR creation + exhaust array
show(742, 747, "exhaust exL/exR anchors + exhaust array");
//2 boost pad mesh creation anchor for trail spawn under pads
show(884, 899, "boost pad mesh/group loop head");
//3 drive dblock: roll the trail+billboards out of the kart shadow re-seat freeze region
show(1477, 1485, "drive dblock: kartShadow re-seat + kart lean (batch 6 trail freezes with kart)");
//4 __r3d hooks cluster tail (find boostUntil/boosting region + where to add boostTrail hook)
show(1755, 1770, "__r3d hooks: boosting/boostPads/triggerBoost/seekLateral");
