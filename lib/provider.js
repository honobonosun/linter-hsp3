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
import { CompositeDisposable } from "atom";
import { getHspcParam } from "./hspc";
import { parser } from "./parser";
import { mightSaveTempFile, mightUnlinkTempFile, compile, checkCompileResult, } from "./compile";
import { messageGenerate } from "./lint";
import AsyncLock from "async-lock";
export default class Provider {
    constructor() {
        this.subscriptions = new CompositeDisposable();
        this.lock = new AsyncLock();
        this.key = "linterhsp3";
        // 依存しているpackagesをインストールするように案内する。
        this.subscriptions.add(atom.packages.onDidActivateInitialPackages(() => {
            if (!atom.inSpecMode())
                require("atom-package-deps").install("linter-hsp3", true);
        }));
    }
    dispose() {
        this.subscriptions.dispose();
    }
    /**
     * atomの通知機能を使って例外を使用者に伝えます。
     * @param error 表示したい例外オブジェクト
     */
    addError(error) {
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
    lint(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (editor.getPath() === undefined)
                return null;
            return this.lock
                .acquire(this.key, () => __awaiter(this, void 0, void 0, function* () {
                const dist = yield mightSaveTempFile(editor);
                const compileResult = yield compile(dist);
                checkCompileResult(compileResult);
                const hspcParam = yield getHspcParam(compileResult, dist);
                const parseResult = parser(compileResult);
                const lintResult = yield messageGenerate(parseResult, dist, hspcParam);
                yield mightUnlinkTempFile(dist);
                return lintResult;
            }))
                .catch((error) => this.addError(error));
        });
    }
}
//# sourceMappingURL=provider.js.map