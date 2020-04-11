"use babel";
import { Range } from "atom";
import { Message, LintResult } from "atom/linter";
import * as iconv from "iconv-lite";
import * as encoding from "encoding-japanese";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";
import { IResult } from "./potage";
import { get } from "./config";
import { Dist } from "./dist";
import { HspcParam } from "./hspc";
import message from "./message";
import { readLink } from "./link";
import { unixpath, win32path, cnvUnixPath } from "./wine";

/**
 * 正規表現の特殊文字をエスケープする。
 * @param word エスケープされる文字
 */
const regExpWordEscape = (word: string) =>
  word.replace(/[*+.?^$\-\|\/\\¥()\[\]{}]/g, v => "\\" + v);

/**
 * バッファ内容からコードページを推測して、string型へデコードします。
 * @param buffer 変換されるバッファ変数
 */
const bufferToString = (buffer: Buffer): string => {
  const charset = encoding.detect(buffer);
  if (!iconv.encodingExists(charset)) throw new Error("Not support codepage");
  return iconv.decode(buffer, charset);
};

/**
 * location.fileから、ファイルパス
 */
const readFile = async (
  location: message["location"],
  dist: Dist,
  hspcParam: HspcParam
): Promise<{ file: string; buffer: Buffer }> => {
  let file: string;
  let buffer: Buffer;
  const curdir = hspcParam.unix?.curdir || hspcParam.curdir;
  const commondir = hspcParam.unix?.commondir || hspcParam.commondir;

  // ファイルのロングパスを求める。
  // もし、wineModeが有効なら、location.fileはwin形のパスが格納されているので、unix系に変換する必要があります。
  if (location.file) {
    file = dist.wine
      ? await readLink(await cnvUnixPath(location.file))
      : location.file;
    if (path.isAbsolute(file)) {
      buffer = await promisify(fs.readFile)(file);
      if (path.basename(file) === get.option.tempName()) file = dist.refname;
    } else {
      const name1 = path.resolve(curdir, file);
      try {
        buffer = await promisify(fs.readFile)(name1);
        file = name1;
      } catch (error) {
        const name2 = path.resolve(commondir, file);
        buffer = await promisify(fs.readFile)(name2);
        file = name2;
      }
    }
  } else {
    file = dist.file !== dist.refname ? dist.refname : dist.file;
    buffer = await promisify(fs.readFile)(file);
  }
  return { file, buffer };
};

/**
 * wordの座標を求めます。
 */
const getRange = (location: message["location"], buffer: Buffer): Range => {
  if (location.line) {
    const line = bufferToString(buffer).split("\n")[location.line - 1];
    if (location.word) {
      const column = line.search(RegExp(regExpWordEscape(location.word), "ig"));

      if (column >= 0)
        return new Range(
          [location.line - 1, column],
          [location.line - 1, column + location.word.length]
        );
      else
        return new Range(
          [location.line - 1, 0],
          [location.line - 1, line.length]
        );
    } else
      return new Range(
        [location.line - 1, 0],
        [location.line - 1, line.length]
      );
  }
  return new Range();
};

/**
 * 位置情報が得られる場合、その位置情報を返します。
 */
const searchLocation = async (
  source: message,
  dist: Dist,
  hspcParam: HspcParam
): Promise<Message["location"]> => {
  let position: Range;
  const { file, buffer } = await readFile(source.location, dist, hspcParam);
  position = getRange(source.location, buffer);
  return {
    file,
    position
  };
};

export const messageGenerate = async (
  source: IResult,
  dist: Dist,
  hspcParam: HspcParam
): Promise<LintResult> => {
  if (!source.success) return null;
  const result: LintResult = [];
  const f = get.option.ShowUninitializedVariable();
  for (const item of source.result as message[]) {
    if (
      !f &&
      item.severity === "info" &&
      item.excerpt === "未初期化の変数があります"
    )
      continue;
    const description =
      item.location.err !== undefined
        ? `${item.location.word} (error:${item.location.err})`
        : item.location.word;
    result.push({
      excerpt: item.excerpt,
      location: await searchLocation(item, dist, hspcParam),
      severity: item.severity,
      description
    });
  }
  return result;
};
