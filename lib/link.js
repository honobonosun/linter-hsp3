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
import { promisify } from "util";
import { exec } from "child_process";
/**
 * シンボリックリンク先のパスを取得します。
 * @param before シンボリックリンクのパス
 */
export const readLink = (before) => __awaiter(void 0, void 0, void 0, function* () {
    const { stdout } = yield promisify(exec)(`readlink -e -n "${before}"`);
    return stdout;
});
//# sourceMappingURL=link.js.map