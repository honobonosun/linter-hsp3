"use babel";

import * as path from "path";

import { get } from "./config";
import { Dist } from "./dist";
import { cwd } from "./executor";
import { readLink } from "./link";
import { cnvUnixPath } from "./wine";

export interface HspcParam {
  curdir: string;
  outname: string;
  commondir: string;
  charset: string;
  unix?: {
    curdir: string;
    outname: string;
    commondir: string;
  };
}

/**
 * コンパイルメッセージから使用された環境情報を取得します。
 * hspc v1.4.2 以降のバージョンが必要です。
 * @param source hspcのコンパイルメッセージ
 * @param dist コンパイルに使用したファイル情報
 */
export const getHspcParam = async (source: string, dist: Dist): Promise<HspcParam> => {
  const r = [
    / Current directory : (.+)/g,
    / Output file : (.+)/g,
    / Common directory : (.+)/g,
    / Codepage mode : .+ \( (\S+) \)/gi
  ].map(v => v.exec(source));
  let curdir: string, outname: string, commondir: string, charset: string;
  if (r[0]) curdir = r[0][1];
  else curdir = cwd(dist.file) || process.cwd();
  if (r[1]) outname = r[1][1];
  else outname = path.basename(dist.file, "ax");  // TODO wineMode
  if (r[2]) commondir = r[2][1];
  else commondir = path.join(path.dirname(get.compiler.path()), "common");
  if (r[3]) charset = r[3][1];
  else charset = "Shift_JIS"; // hspcの既定値

  let unix: HspcParam["unix"] = undefined;
  if (get.option.wineMode()) {
    const cd = await readLink(await cnvUnixPath(curdir))
    unix = {
      curdir: cd,
      outname: await cnvUnixPath(outname, cd),  // なぜかシンボリックリンクじゃない
      commondir: await readLink(await cnvUnixPath(commondir, cd))
    }
  }

  return {
    curdir,
    outname,
    commondir,
    charset,
    unix
  };
};
