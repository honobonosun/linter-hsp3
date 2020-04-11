"use babel";
import * as potage from "./potage";
import message from "./message";

const newline = (str1: string, str2: string) =>
  (str1 === "\r" && str2 === "\n") || str1 === "\n";

const regexps = (regexp: RegExp[], text: string[]) => {
  let i = 0;
  return regexp.map(v => v.exec(text[i++]));
};

const g = new potage.Generator<string[]>();

/**
 * target引数に渡されたデータから行単位に区切り、resultプロパティにstring[]型で格納します。
 * @param cnt 何行取得するか
 */
const line = (cnt = 0) =>
  g.satisfy((t, p) => {
    if (p >= t.length) return undefined;
    let i = 0;
    let offset = p;
    const line: string[] = [];
    for (const char of t.slice(p + i, t.length)) {
      if (newline(char, t[i + 1])) {
        if (cnt <= 0) {
          line.push(t.slice(offset, offset + i).join(""));
          break;
        } else {
          line.push(t.slice(offset, offset + i).join(""));
          i += char === "\r" ? 2 : 1;
          offset = p + i;
        }
        cnt--;
      } else i++;
    }
    return {
      next: p + i + (t[p + i] === "\r" ? 2 : 1),
      far: p,
      result: line
    };
  });

/**
 * 一行飛ばす
 */
export const any = g.satisfy((t, p) => {
  if (p >= t.length) return undefined;
  let i = 0;
  for (const char of t.slice(p + i, t.length)) {
    if (newline(char, t[i + 1])) break;
    else i++;
  }
  return {
    next: p + i + (t[p + i] === "\r" ? 2 : 1),
    far: p,
    result: null
    /* result: { any: t.slice(p,p+i+(t[p + i] === "\r" ? 2 : 1)).join("") }　/* debug only */
  };
});

export const variable_is_not_initialized_exist = g.satisfy((t, p) => {
  const l = line(0)(t, p);
  if (!l.success) return undefined;

  const r = /#未初期化の変数があります(.+)/.exec(l.result[0]);
  if (!r) return undefined;
  return {
    next: l.location[0],
    far: l.location[1],
    result: new message("未初期化の変数があります", "info", { word: r[1] })
  };
});

const macro_stack_is_not_free = g.satisfy((t, p) => {
  const l = line(2)(t, p);
  if (!l.success) return undefined;

  const r = regexps(
    [
      /#スタックが空になっていないマクロタグが1個あります\s+\[(.+)\]/,
      /\s*(.+)/i
    ],
    l.result
  );
  if (!r[0] || !r[1]) return undefined;

  return {
    next: l.location[0],
    far: l.location[1],
    result: new message(
      "スタックが空になっていないマクロタグがあります",
      "error",
      {
        file: r[0][1],
        word: r[1][1]
      }
    )
  };
});

const include_file_is_not_found = g.satisfy((t, p) => {
  const l = line(2)(t, p);
  if (!l.success) return undefined;

  const r = regexps(
    [
      /#スクリプトファイルが見つかりません \[(.+)]/,
      /#Error: in line (\d+) \[(.+)]/i
    ],
    l.result
  );
  if (!r[0] || !r[1]) return undefined;

  return {
    next: l.location[0],
    far: l.location[1],
    result: new message("スクリプトファイルが見つかりません", "error", {
      file: r[1][2],
      line: Number(r[1][1]),
      word: r[0][1]
    })
  };
});

const nonDefined = g.satisfy((t, p) => {
  const l = line(1)(t, p);
  if (!l.success) return undefined;

  const r = regexps(
    [
      /#(?!Error)(.+せん) \[(.+)\]/,
      /(.+)\((\d+)\) : error (\d+) : 致命的なエラーです \((\d+)行目\)/
    ],
    l.result
  );
  if (r[0] && r[1])
    return {
      next: l.location[0],
      far: l.location[1],
      result: new message(r[0][1], "error", {
        file: r[1][1],
        line: Number(r[1][2]),
        word: r[0][2],
        err: Number(r[1][3])
      })
    };
  else return undefined;
});

const syntaxError = g.satisfy((t, p) => {
  const l = line(1)(t, p);
  if (!l.success) return undefined;

  const r = regexps(
    [/(.+)\((\d+)\) : error (\d+) : (.+) \((\d+)行目\)/i, /\s*-->\s*(.+)/i],
    l.result
  );
  if (r[0] && r[1])
    return {
      next: l.location[0],
      far: l.location[1],
      result: new message(r[0][4], "error", {
        file: r[0][1],
        line: Number(r[0][2]),
        word: r[1][1],
        err: Number(r[0][3])
      })
    };
  else return undefined;
});

const criticalError = g.satisfy((t, p) => {
  const l = line(1)(t, p);
  if (!l.success) return undefined;

  const next = l.location[0],
    far = l.location[1];

  let r: RegExpExecArray | null;
  r = /#Error:(.+) \[(.+)\] in line (\d+) \[(.+)\]/.exec(l.result[0]);
  if (r)
    return {
      next,
      far,
      result: new message(`Error ${r[1]}`, "error", {
        file: r[4],
        line: Number(r[3]),
        word: r[2]
      })
    };
  r = /#Error:(.+) in line (\d+) \[(.+)\]/.exec(l.result[0]);
  if (r)
    return {
      next,
      far,
      result: new message(r[1], "error", { file: r[3], line: Number(r[2]) })
    };
  r = /#Error: in line (\d+) \[(.+)]/.exec(l.result[0]);
  if (r)
    return {
      next,
      far,
      result: new message("重大なエラーが検出されています", "error", {
        file: r[2],
        line: Number(r[1])
      })
    };
  return undefined;
});

export const parser = (source: string) =>
  g.map(
    g.many(
      g.choice(
        variable_is_not_initialized_exist,
        macro_stack_is_not_free,
        include_file_is_not_found,
        nonDefined,
        syntaxError,
        criticalError,
        any
      )
    ),
    r => r.result.many.filter((v: any) => v.choice).map((v: any) => v.choice)
  )(Array.from(source), 0);
