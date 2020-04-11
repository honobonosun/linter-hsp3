"use babel";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ファイルパスに関わるコード
import { get } from "./config";
import { exec, cwd } from "./executor";
export const distMake = (file, refname) => __awaiter(void 0, void 0, void 0, function* () {
    if (get.option.wineMode()) {
        const v = (yield exec("winepath", ["-w", file, refname], undefined, cwd(file)))
            .split("\n")
            .slice(0, -1);
        return {
            file,
            refname,
            wine: {
                file: v[0],
                refname: v[1]
            }
        };
    }
    else
        return {
            file,
            refname
        };
});
//# sourceMappingURL=dist.js.map