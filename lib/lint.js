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
import { Range } from "atom";
import * as iconv from "iconv-lite";
import * as encoding from "encoding-japanese";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";
import { get } from "./config";
import { readLink } from "./link";
import { cnvUnixPath } from "./wine";
/**
 * 正規表現の特殊文字をエスケープする。
 * @param word エスケープされる文字
 */
const regExpWordEscape = (word) => word.replace(/[*+.?^$\-\|\/\\¥()\[\]{}]/g, v => "\\" + v);
/**
 * バッファ内容からコードページを推測して、string型へデコードします。
 * @param buffer 変換されるバッファ変数
 */
const bufferToString = (buffer) => {
    const charset = encoding.detect(buffer);
    if (!iconv.encodingExists(charset))
        throw new Error("Not support codepage");
    return iconv.decode(buffer, charset);
};
/**
 * location.fileから、ファイルパス
 */
const readFile = (location, dist, hspcParam) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let file;
    let buffer;
    const curdir = ((_a = hspcParam.unix) === null || _a === void 0 ? void 0 : _a.curdir) || hspcParam.curdir;
    const commondir = ((_b = hspcParam.unix) === null || _b === void 0 ? void 0 : _b.commondir) || hspcParam.commondir;
    // ファイルのロングパスを求める。
    // もし、wineModeが有効なら、location.fileはwin形のパスが格納されているので、unix系に変換する必要があります。
    if (location.file) {
        file = dist.wine
            ? yield readLink(yield cnvUnixPath(location.file))
            : location.file;
        if (path.isAbsolute(file)) {
            buffer = yield promisify(fs.readFile)(file);
            if (path.basename(file) === get.option.tempName())
                file = dist.refname;
        }
        else {
            const name1 = path.resolve(curdir, file);
            try {
                buffer = yield promisify(fs.readFile)(name1);
                file = name1;
            }
            catch (error) {
                const name2 = path.resolve(commondir, file);
                buffer = yield promisify(fs.readFile)(name2);
                file = name2;
            }
        }
    }
    else {
        file = dist.file !== dist.refname ? dist.refname : dist.file;
        buffer = yield promisify(fs.readFile)(file);
    }
    return { file, buffer };
});
/**
 * wordの座標を求めます。
 */
const getRange = (location, buffer) => {
    if (location.line) {
        const line = bufferToString(buffer).split("\n")[location.line - 1];
        if (location.word) {
            const column = line.search(RegExp(regExpWordEscape(location.word), "ig"));
            if (column >= 0)
                return new Range([location.line - 1, column], [location.line - 1, column + location.word.length]);
            else
                return new Range([location.line - 1, 0], [location.line - 1, line.length]);
        }
        else
            return new Range([location.line - 1, 0], [location.line - 1, line.length]);
    }
    return new Range();
};
/**
 * 位置情報が得られる場合、その位置情報を返します。
 */
const searchLocation = (source, dist, hspcParam) => __awaiter(void 0, void 0, void 0, function* () {
    let position;
    const { file, buffer } = yield readFile(source.location, dist, hspcParam);
    position = getRange(source.location, buffer);
    return {
        file,
        position
    };
});
export const messageGenerate = (source, dist, hspcParam) => __awaiter(void 0, void 0, void 0, function* () {
    if (!source.success)
        return null;
    const result = [];
    const f = get.option.ShowUninitializedVariable();
    for (const item of source.result) {
        if (!f &&
            item.severity === "info" &&
            item.excerpt === "未初期化の変数があります")
            continue;
        const description = item.location.err !== undefined
            ? `${item.location.word} (error:${item.location.err})`
            : item.location.word;
        result.push({
            excerpt: item.excerpt,
            location: yield searchLocation(item, dist, hspcParam),
            severity: item.severity,
            description
        });
    }
    return result;
});
//# sourceMappingURL=lint.js.map