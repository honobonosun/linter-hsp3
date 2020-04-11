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
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as iconv from "iconv-lite";
import { get, normalize } from "./config";
import { distMake } from "./dist";
import { exec, cwd } from "./executor";
/**
 * 指定したeditorが未保存の変更を保持している場合、ファイルと同じディレクトリに
 * 一時ファイルを保存してそのファイルパスを返します。ファイルと同一だった場合、
 * そのファイルパスを返します。
 * @param editor 保存したいatomのTextEditor
 */
export const mightSaveTempFile = (editor) => __awaiter(void 0, void 0, void 0, function* () {
    if (editor.isModified()) {
        // 一時ファイルの保存パスを求める
        const file = editor.getPath();
        if (!file)
            throw new Error("Failed to get open file path in editor.");
        const dist = path.join(path.dirname(file), get.option.tempName());
        // 保存する
        const charset = editor.getEncoding();
        if (charset === "utf8") {
            yield promisify(fs.writeFile)(dist, editor.getText(), {
                encoding: "utf8",
            });
        }
        else if (charset === "shiftjis") {
            yield promisify(fs.writeFile)(dist, "");
            const fd = yield promisify(fs.open)(dist, "w");
            const buf = iconv.encode(editor.getText(), "Shift_JIS");
            yield promisify(fs.write)(fd, buf, 0, buf.length);
            yield promisify(fs.close)(fd);
        }
        else {
            throw new Error("charset must be utf8 or shiftjis.");
        }
        return distMake(dist, file);
    }
    else {
        const file = editor.getPath();
        if (!file)
            throw new Error("Failed to get open file path in editor.");
        return distMake(file, file);
    }
});
/**
 * 一時ファイルが作成されていた場合、そのファイルを削除します。
 * @param dist mightSaveTempFile関数の返り値
 */
export const mightUnlinkTempFile = (dist) => __awaiter(void 0, void 0, void 0, function* () {
    if (dist.file !== dist.refname)
        yield promisify(fs.unlink)(dist.file);
});
/**
 * hspcを使ってdist.fileで指定されているファイルをコンパイルして、コンパイルメッセージを返します。
 * @param dist mightSaveTempFile関数の返り値
 */
export const compile = (dist) => {
    let cmd, args;
    if (dist.wine) {
        cmd = "wine";
        args = [get.compiler.path(), ...normalize(get.compiler.arguments(), dist)];
    }
    else {
        cmd = get.compiler.path();
        args = normalize(get.compiler.arguments(), dist);
    }
    return exec(cmd, args, "shiftjis", cwd(dist.file));
};
export const checkCompileResult = (str) => {
    if (atom.inDevMode())
        console.log("linter-hsp3", "compileResult", str);
    if (str === "")
        throw new Error("コマンドの実行を確認できませんでした。");
};
//# sourceMappingURL=compile.js.map