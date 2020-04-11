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
import * as path from "path";
import { get } from "./config";
import { cwd } from "./executor";
import { readLink } from "./link";
import { cnvUnixPath } from "./wine";
/**
 * コンパイルメッセージから使用された環境情報を取得します。
 * hspc v1.4.2 以降のバージョンが必要です。
 * @param source hspcのコンパイルメッセージ
 * @param dist コンパイルに使用したファイル情報
 */
export const getHspcParam = (source, dist) => __awaiter(void 0, void 0, void 0, function* () {
    const r = [
        / Current directory : (.+)/g,
        / Output file : (.+)/g,
        / Common directory : (.+)/g,
        / Codepage mode : .+ \( (\S+) \)/gi
    ].map(v => v.exec(source));
    let curdir, outname, commondir, charset;
    if (r[0])
        curdir = r[0][1];
    else
        curdir = cwd(dist.file) || process.cwd();
    if (r[1])
        outname = r[1][1];
    else
        outname = path.basename(dist.file, "ax"); // TODO wineMode
    if (r[2])
        commondir = r[2][1];
    else
        commondir = path.join(path.dirname(get.compiler.path()), "common");
    if (r[3])
        charset = r[3][1];
    else
        charset = "Shift_JIS"; // hspcの既定値
    let unix = undefined;
    if (get.option.wineMode()) {
        const cd = yield readLink(yield cnvUnixPath(curdir));
        unix = {
            curdir: cd,
            outname: yield cnvUnixPath(outname, cd),
            commondir: yield readLink(yield cnvUnixPath(commondir, cd))
        };
    }
    return {
        curdir,
        outname,
        commondir,
        charset,
        unix
    };
});
//# sourceMappingURL=hspc.js.map