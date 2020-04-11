"use babel";
import { LinterProvider } from "atom/linter";
import { settings, get } from "./config";
import Provider from "./provider";

let provider: Provider;

export const config = settings;

export const activate = () => {
  provider = new Provider();
  //require("atom-package-deps").install("linter", true);
};

export const deactivate = () => {
  provider.dispose();
};

export const provideLinter = (): LinterProvider => ({
  name: "hsp3",
  scope: "file",
  lintsOnChange: get.option.lintsOnChange(),
  grammarScopes: ["source.hsp3"],
  lint: editor => provider.lint(editor)
});
