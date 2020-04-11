"use babel";
export const settings = {
    compiler: {
        order: 1,
        title: "Compiler Settings",
        type: "object",
        properties: {
            path: {
                order: 1,
                title: "Compiler path",
                description: "使用するコンパイラを絶対パスで指定してください。",
                type: "string",
                default: "C:/hsp35/hspc.exe",
            },
            arguments: {
                order: 2,
                title: "オプション文字",
                description: "hspc v1 を使用するには、\"コマンドをShell経由で実行する\"と、\"Delete quotation character\"をOnにして、オプション文字を`-oout, -aCDEI, %FILEPATH%`に設定してください。",
                type: "array",
                default: ["-oout", "-aCDEI", "--refname", "%REFNAME%", "%FILEPATH%"],
            },
            curdir: {
                order: 3,
                title: "カレントディレクトリを合わせる",
                description: "コンパイル時にカレントディレクトリをどこに合わせるか設定します。",
                type: "string",
                default: "file",
                enum: [
                    {
                        value: "file",
                        description: "ファイルのディレクトリ",
                    },
                    {
                        value: "project",
                        description: "プロジェクトルートのディレクトリ",
                    },
                    { value: "none", description: "未設定にする" },
                ],
            },
            useShell: {
                order: 4,
                title: "コマンドをShell経由で実行する",
                description: "hspc v1を使用する もしくは、Wineを使用する場合は、trueに変更してください。\n\nこの機能を有効にすると、存在しないコマンドを実行してもエラーが表示されないことに留意してください。",
                type: "boolean",
                default: process.platform !== "win32",
            },
            useEscape: {
                order: 5,
                title: "\\文字をエスケープする",
                description: "Shellが\\文字をエスケープ文字として扱う場合は、trueに変更してください。",
                type: "boolean",
                default: process.platform !== "win32",
            },
            UsekillQuiotations: {
                order: 6,
                title: "Delete quotation character",
                description: "ソースファイルパスにダブルクオーテーションを付けません。",
                type: "boolean",
                default: false,
            },
        },
    },
    option: {
        order: 2,
        title: "Package Option Settings",
        type: "object",
        properties: {
            ShowUninitializedVariable: {
                order: 1,
                title: "未初期化変数を表示する",
                type: "boolean",
                default: true,
            },
            lintsOnChange: {
                order: 2,
                title: "未保存のエディタを解析する",
                type: "boolean",
                default: true,
            },
            wineMode: {
                order: 3,
                title: "Wineを使用する",
                type: "boolean",
                default: process.platform !== "win32",
            },
            tempName: {
                order: 4,
                title: "一時保存用のファイル名",
                type: "string",
                default: "linthsptmp",
            },
        },
    },
};
const key = "linter-hsp3";
export const get = {
    compiler: {
        path: () => atom.config.get(`${key}.compiler.path`),
        arguments: () => atom.config.get(`${key}.compiler.arguments`),
        curdir: () => atom.config.get(`${key}.compiler.curdir`),
        useShell: () => atom.config.get(`${key}.compiler.useShell`),
        useEscape: () => atom.config.get(`${key}.compiler.useEscape`),
        useKillQuiotations: () => atom.config.get(`${key}.compiler.UsekillQuiotations`),
        shell: () => {
            switch (atom.config.get(`${key}.compiler.shell.mode`)) {
                case "none":
                    return false;
                case "use":
                    return true;
                case "custom":
                    return atom.config.get(`${key}.compiler.shell.customPath`) || true;
                default:
                    return false;
            }
        },
    },
    option: {
        ShowUninitializedVariable: () => atom.config.get(`${key}.option.ShowUninitializedVariable`),
        lintsOnChange: () => atom.config.get(`${key}.option.lintsOnChange`),
        wineMode: () => atom.config.get(`${key}.option.wineMode`),
        tempName: () => atom.config.get(`${key}.option.tempName`),
    },
};
/**
 * 特殊文字を実用な文字に置き換えて値を返します。
 * @param source 置き換え元のデータ
 * @param dist 置き換えに必要なデータ
 */
export const normalize = (source, dist) => {
    source = source.map((value) => {
        var _a, _b;
        switch (value) {
            case "%FILEPATH%":
                return ((_a = dist.wine) === null || _a === void 0 ? void 0 : _a.file) || dist.file;
            case "%REFNAME%":
                return ((_b = dist.wine) === null || _b === void 0 ? void 0 : _b.refname) || dist.refname;
            default:
                return value;
        }
    });
    return source;
};
//# sourceMappingURL=config.js.map