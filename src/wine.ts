"use babel";

import { exec } from "./executor";

/**
 * winepathを使用して、ファイルパスの形式を変換します。
 * @param mode "-w"でunix系をwin32系へ、"-u"でwin32系をunix系へ変換します。
 * @param paths 変換するファイルパス、配列なので一度に変換できます。
 * @param cwd カレントディレクトリを指定します。相対パスを正しく変換するには、この引数が必要です。
 */
const winepath = async (
  mode: "-w" | "-u",
  paths: string[],
  cwd?: string
): Promise<string[]> => {
  const result = await exec("winepath", [mode, ...paths], undefined, cwd).catch(
    (reason: Error) => {
      throw reason;
    }
  );
  return result.split("\n").slice(0, -1);
};

/**
 * unix形式のパスをwinepathでwindows形式へ変換します。
 * @param paths windows形式へ変換するunix形式のパス
 * @param cwd カレントディレクトリを指定します
 */
export const win32path = (paths: string[], cwd?: string) =>
  winepath("-w", paths, cwd);

/**
 * windows形式のパスをwinepathでunix形式へ変換します。
 * @param paths unix形式へ変換するwindows形式のパス
 * @param cwd カレントディレクトリを指定します
 */
export const unixpath = (paths: string[], cwd?: string) =>
  winepath("-u", paths, cwd);

export const cnvUnixPath = async (before: string, cwd?: string) => {
  const after = await unixpath([before], cwd).then(
    (value: string[]) => value[0],
    (reason: Error) => reason
  );
  if (after instanceof Error) throw after;
  else return after;
};
