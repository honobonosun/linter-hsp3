"use babel";
import { settings, get } from "./config";
import Provider from "./provider";
let provider;
export const config = settings;
export const activate = () => {
    provider = new Provider();
    //require("atom-package-deps").install("linter", true);
};
export const deactivate = () => {
    provider.dispose();
};
export const provideLinter = () => ({
    name: "hsp3",
    scope: "file",
    lintsOnChange: get.option.lintsOnChange(),
    grammarScopes: ["source.hsp3"],
    lint: editor => provider.lint(editor)
});
//# sourceMappingURL=index.js.map