"use babel";
import { promisify } from "util";
import { exec } from "child_process";

/**
 * シンボリックリンク先のパスを取得します。
 * @param before シンボリックリンクのパス
 */
export const readLink = async (before: string) => {
  const { stdout } = await promisify(exec)(`readlink -e -n "${before}"`);
  return stdout;
};
