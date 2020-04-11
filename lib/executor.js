"use babel";
// 実行に関わるコード
import * as path from "path";
import * as child_process from "child_process";
import * as iconv from "iconv-lite";
import * as app from "./util";
import { get } from "./config";
/**
 * bash向けに文字列内の"\\"文字を"\\\\"に変換します。
 * @param source 変換される文字列
 */
const escapeBackSlash = (source) => source.map((v) => v.replace(/\\/g, "\\\\"));
/**
 * hspc.v1系向けに、ダブルクォーテーションを削除します。
 * @param source hspcへの引数
 */
const removeQuotation = (source) => [
    source.join(" ").replace(/\"/g, ""),
];
/**
 * コマンドを実行します。実行結果をdecode指定でデコードしてstringで返します。
 * @param cmd 実行するコマンド
 * @param args コマンドの引数
 * @param decode コマンド出力をデコードするか
 * @param cwd カレントディレクトリのディレクトリパス
 */
export const exec = (cmd, args, decode, cwd) => new Promise((resolve, reject) => {
    if (get.compiler.useEscape())
        args = escapeBackSlash(args);
    if ((cmd.toLowerCase() !== "wine" ||
        cmd.toLowerCase() !== "winepath" ||
        cmd.toLowerCase() !== "wslpath") &&
        get.compiler.useKillQuiotations())
        args = removeQuotation(args);
    if (app.inDevMode())
        console.log("linter-hsp3", "exec", cmd, args);
    let proc;
    try {
        proc = child_process.spawn(cmd, args, {
            cwd,
            shell: get.compiler.useShell(),
        });
    }
    catch (reason) {
        return reject(reason);
    }
    proc.on("error", (reason) => reject(reason));
    let cache = Buffer.from("");
    proc.stdout.on("data", (chunk) => (cache = Buffer.concat([cache, chunk])));
    proc.on("close", () => {
        if (app.inDevMode())
            console.log("linter-hsp3", "proc", proc);
        if (decode)
            return resolve(iconv.decode(cache, decode));
        else
            return resolve(cache.toString("utf8"));
    });
});
/**
 * 実行時にカレントディレクトリを設定するか調べて取得します。
 * undefinedを返した場合、設定する必要が無いことを示します。
 * @param file カレントディレクトリを調べるファイルパス
 */
export const cwd = (file) => {
    const mode = get.compiler.curdir();
    if (mode === "file")
        return path.dirname(file);
    else if (mode === "project") {
        const paths = atom.project.relativizePath(file);
        if (paths[0])
            return paths[0];
        else
            return undefined;
    }
    else
        return undefined;
};
//# sourceMappingURL=executor.js.map