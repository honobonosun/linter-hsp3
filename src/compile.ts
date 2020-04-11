"use babel";
import { TextEditor } from "atom";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as iconv from "iconv-lite";
import { get, normalize } from "./config";
import { Dist, distMake } from "./dist";
import { exec, cwd } from "./executor";

/**
 * 指定したeditorが未保存の変更を保持している場合、ファイルと同じディレクトリに
 * 一時ファイルを保存してそのファイルパスを返します。ファイルと同一だった場合、
 * そのファイルパスを返します。
 * @param editor 保存したいatomのTextEditor
 */
export const mightSaveTempFile = async (editor: TextEditor): Promise<Dist> => {
  if (editor.isModified()) {
    // 一時ファイルの保存パスを求める
    const file = editor.getPath();
    if (!file) throw new Error("Failed to get open file path in editor.");
    const dist = path.join(path.dirname(file), get.option.tempName());
    // 保存する
    const charset = editor.getEncoding();
    if (charset === "utf8") {
      await promisify(fs.writeFile)(dist, editor.getText(), {
        encoding: "utf8",
      });
    } else if (charset === "shiftjis") {
      await promisify(fs.writeFile)(dist, "");
      const fd = await promisify(fs.open)(dist, "w");
      const buf = iconv.encode(editor.getText(), "Shift_JIS");
      await promisify(fs.write)(fd, buf, 0, buf.length);
      await promisify(fs.close)(fd);
    } else {
      throw new Error("charset must be utf8 or shiftjis.");
    }
    return distMake(dist, file);
  } else {
    const file = editor.getPath();
    if (!file) throw new Error("Failed to get open file path in editor.");
    return distMake(file, file);
  }
};

/**
 * 一時ファイルが作成されていた場合、そのファイルを削除します。
 * @param dist mightSaveTempFile関数の返り値
 */
export const mightUnlinkTempFile = async (dist: Dist) => {
  if (dist.file !== dist.refname) await promisify(fs.unlink)(dist.file);
};

/**
 * hspcを使ってdist.fileで指定されているファイルをコンパイルして、コンパイルメッセージを返します。
 * @param dist mightSaveTempFile関数の返り値
 */
export const compile = (dist: Dist): Promise<string> => {
  let cmd: string, args: string[];
  if (dist.wine) {
    cmd = "wine";
    args = [get.compiler.path(), ...normalize(get.compiler.arguments(), dist)];
  } else {
    cmd = get.compiler.path();
    args = normalize(get.compiler.arguments(), dist);
  }
  return exec(cmd, args, "shiftjis", cwd(dist.file));
};

export const checkCompileResult = (str: string) => {
  if (atom.inDevMode())
    console.log("linter-hsp3", "compileResult", str);
  if (str === "") throw new Error("コマンドの実行を確認できませんでした。");
};
