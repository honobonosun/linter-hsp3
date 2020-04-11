"use babel";
import { CompositeDisposable, TextEditor } from "atom";
import { LintResult } from "atom/linter";
import { getHspcParam } from "./hspc";
import { parser } from "./parser";
import {
  mightSaveTempFile,
  mightUnlinkTempFile,
  compile,
  checkCompileResult,
} from "./compile";
import { messageGenerate } from "./lint";
import AsyncLock from "async-lock";

export default class Provider {
  private readonly lock: AsyncLock;
  private readonly key: string;
  private readonly subscriptions: CompositeDisposable;

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.lock = new AsyncLock();
    this.key = "linterhsp3";

    // 依存しているpackagesをインストールするように案内する。
    this.subscriptions.add(
      atom.packages.onDidActivateInitialPackages(() => {
        if (!atom.inSpecMode())
          require("atom-package-deps").install("linter-hsp3", true);
      })
    );

  }
  public dispose() {
    this.subscriptions.dispose();
  }

  /**
   * atomの通知機能を使って例外を使用者に伝えます。
   * @param error 表示したい例外オブジェクト
   */
  private addError(error: Error) {
    console.error("linter-hsp3", error.name, error.message, error.stack);
    atom.notifications.addError(`${error.name} (linter-hsp3)`, {
      detail: error.message,
      stack: error.stack
    });
    return null;
  }

  /**
   * エディタを解析します。
   * @param editor 評価するTextEditor
   */
  public async lint(editor: TextEditor): Promise<LintResult> {
    if (editor.getPath() === undefined) return null;
    return this.lock
      .acquire(
        this.key,
        async (): Promise<LintResult> => {
          const dist = await mightSaveTempFile(editor);
          const compileResult = await compile(dist);
          checkCompileResult(compileResult);
          const hspcParam = await getHspcParam(compileResult, dist);
          const parseResult = parser(compileResult);
          const lintResult = await messageGenerate(
            parseResult,
            dist,
            hspcParam
          );
          await mightUnlinkTempFile(dist);
          return lintResult;
        }
      )
      .catch((error) => this.addError(error));
  }
}
