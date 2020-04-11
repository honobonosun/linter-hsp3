"use babel";
/**
 * パーサ関数を作るクラス
 */
export class Generator {
    /**
     * **基礎メソッド**
     *
     * コールバック関数でパースの実処理を行います。
     *
     * @param fn パースして結果を返すコールバック関数
     */
    satisfy(fn) {
        return function (target, position) {
            const value = fn(target, position);
            let location = [position, position, position];
            let result = undefined;
            if (value) {
                location = [value.next, position, value.far];
                result = value.result;
            }
            return {
                success: value !== undefined,
                location,
                result,
                log: []
            };
        };
    }
    /**
     * **プライベートな基礎メソッド**
     *
     * コールバック関数がstringを返した場合、その内容がlogプロパティにpushされます。
     * falseの場合、何もしません。
     * @param parser ロギング対象のパーサ関数
     * @param fn ロギングの実処理を行うコールバック関数
     */
    static logging(parser, fn) {
        return function (target, position) {
            const parsed = parser(target, position);
            const text = fn(parsed);
            if (text)
                parsed.log.push(text);
            return parsed;
        };
    }
    // 使うのはこっち
    /**
     * コールバック関数の返り値がstring型の場合、その内容をlogプロパティにpushします。
     * falseの場合、何もしません。
     * @param parser ロギング対象のパーサ関数
     * @param fn
     */
    logging(parser, fn) {
        return Generator.logging(parser, fn);
    }
    /**
     * 渡されたパーサ関数が失敗判定を出したらコールバック関数を呼んでロギングします。
     *
     * コールバック関数の返り値がstring型の場合、その内容をlogプロパティにpushします。
     * falseの場合、何もしません。
     * @param parser 失敗判定ならロギングするパーサ関数
     * @param fn ロギングの実処理をするコールバック関数
     */
    desc(parser, fn) {
        return Generator.logging(parser, r => (r.success ? undefined : fn(r)));
    }
    /**
     * 渡されたすべてのパーサ関数が成功すれば、その結果を纏めてresultプロパティへ格納するように加工します。
     *
     * どれかひとつでも失敗した場合、失敗判定を返します。
     * @param parsers 成功を望むパーサ関数たち
     */
    seq(...parsers) {
        return function (target, position) {
            const readPosition = position;
            let farPosition = position;
            let success = true;
            let result = { seq: [] };
            let log = [];
            for (const parser of parsers) {
                const parsed = parser(target, position);
                log = log.concat(parsed.log);
                if (parsed.success) {
                    result.seq.push(parsed.result);
                    position = parsed.location[0];
                    farPosition = parsed.location[2];
                }
                else {
                    success = false;
                    break;
                }
            }
            const location = [
                position,
                readPosition,
                farPosition
            ];
            return { success, location, result, log };
        };
    }
    /**
     * 渡されたパーサ関数を順番に実行して、最初に成功したパーサ関数の結果をresultプロパティに格納するように加工します。
     *
     * すべて失敗判定を返した場合、失敗判定を返します。
     * @param parsers 成功を望むパーサ関数たち
     */
    choice(...parsers) {
        return function (target, position) {
            let log = [];
            for (const parser of parsers) {
                const parsed = parser(target, position);
                log = log.concat(parsed.log);
                if (parsed.success) {
                    return {
                        success: true,
                        location: parsed.location,
                        result: { choice: parsed.result },
                        log
                    };
                }
            }
            return {
                success: false,
                location: [position, position, position],
                result: undefined,
                log
            };
        };
    }
    /**
     * 渡されたパーサ関数が失敗するまで繰り返すように加工します。
     *
     * 最初から失敗しても、成功判定を返します。
     *
     * コールバック関数を設定することで、ループ文のようにbreakさせることができます。
     * @param parser 失敗するまで何度も繰り返されるパーサ関数
     * @param fn 途中で脱出させるか判定するコールバック関数
     */
    many(parser, fn) {
        return function (target, position) {
            const readPosition = position;
            let farPosition = position;
            let result = { many: [] };
            let log = [];
            for (;;) {
                const parsed = parser(target, position);
                log = log.concat(parsed.log);
                if (fn === undefined
                    ? parsed.success
                    : parsed.success
                        ? fn(parsed)
                        : false) {
                    result.many.push(parsed.result);
                    position = parsed.location[0];
                    farPosition = parsed.location[2];
                }
                else {
                    break;
                }
            }
            const location = [
                position,
                readPosition,
                farPosition
            ];
            return {
                success: true,
                location,
                result,
                log
            };
        };
    }
    /**
     * 渡されたパーサ関数が失敗判定を出しても、成功判定に置き換えるように加工します。
     * @param parser 失敗してもいいパーサ関数
     */
    optional(parser) {
        return function (target, position) {
            const { location, result, log } = parser(target, position);
            return {
                success: true,
                location,
                result: { optional: result },
                log
            };
        };
    }
    /**
     * 渡されたパーサ関数のresultプロパティをコールバック関数で加工されるように加工します。
     * @param parser resultプロパティを加工されるパーサ関数
     * @param fn resultプロパティを加工するコールバック関数
     */
    map(parser, fn) {
        return function (target, position) {
            const parsed = parser(target, position);
            if (parsed.success) {
                return {
                    success: parsed.success,
                    location: parsed.location,
                    result: fn(parsed),
                    log: parsed.log
                };
            }
            else {
                return parsed;
            }
        };
    }
    /**
     * コールバック関数で返ってきたパーサ関数を必要になった時点で計算する、遅延評価を行います。
     * @param fn パーサ関数を返すコールバック関数
     */
    lazy(fn) {
        let parser;
        return function (target, position) {
            if (!parser)
                parser = fn();
            return parser(target, position);
        };
    }
}
//# sourceMappingURL=potage.js.map