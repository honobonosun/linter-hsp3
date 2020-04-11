"use babel";
// ファイルパスに関わるコード

import { get } from "./config";
import { exec, cwd } from "./executor";

export interface Dist {
  file: string;
  refname: string;
  wine?: {
    file: string;
    refname: string;
  };
}

export const distMake = async (
  file: string,
  refname: string
): Promise<Dist> => {
  if (get.option.wineMode()) {
    const v = (await exec("winepath", ["-w", file, refname], undefined, cwd(file)))
      .split("\n")
      .slice(0, -1);
    return {
      file,
      refname,
      wine: {
        file: v[0],
        refname: v[1]
      }
    };
  } else
    return {
      file,
      refname
    };
};
