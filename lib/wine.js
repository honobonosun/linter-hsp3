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
import { exec } from "./executor";
/**
 * winepathを使用して、ファイルパスの形式を変換します。
 * @param mode "-w"でunix系をwin32系へ、"-u"でwin32系をunix系へ変換します。
 * @param paths 変換するファイルパス、配列なので一度に変換できます。
 * @param cwd カレントディレクトリを指定します。相対パスを正しく変換するには、この引数が必要です。
 */
const winepath = (mode, paths, cwd) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exec("winepath", [mode, ...paths], undefined, cwd).catch((reason) => {
        throw reason;
    });
    return result.split("\n").slice(0, -1);
});
/**
 * unix形式のパスをwinepathでwindows形式へ変換します。
 * @param paths windows形式へ変換するunix形式のパス
 * @param cwd カレントディレクトリを指定します
 */
export const win32path = (paths, cwd) => winepath("-w", paths, cwd);
/**
 * windows形式のパスをwinepathでunix形式へ変換します。
 * @param paths unix形式へ変換するwindows形式のパス
 * @param cwd カレントディレクトリを指定します
 */
export const unixpath = (paths, cwd) => winepath("-u", paths, cwd);
export const cnvUnixPath = (before, cwd) => __awaiter(void 0, void 0, void 0, function* () {
    const after = yield unixpath([before], cwd).then((value) => value[0], (reason) => reason);
    if (after instanceof Error)
        throw after;
    else
        return after;
});
//# sourceMappingURL=wine.js.map