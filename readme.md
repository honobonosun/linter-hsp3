# linter-hsp3
hspcを使って、linterにエラーなどを通知するパッケージです。

## 簡単なパッケージの導入方法
1. [hspc v2](http://dev.onionsoft.net/seed/info.ax?id=1392)をダウンロードして、HSP3がインストールされているフォルダに導入してください。
2. ターミナルorコマンドプロントで`apm install linter-hsp3`を実行してください。<br>もしくは、atomの設定からパッケージインストール画面で、linter-hsp3を検索してインストールしてください。
3. apmでインストール後に、`atom`を実行してください。
4. 立ち上がったatomに追加のパッケージインストール案内が表示されるので、インストールしてください。
5. linter-hsp3のパッケージ設定にhspc.exeの絶対パスを設定してください。
6. hspファイルを開いて、存在しない命令を書いて構文エラーが通知されれば完了です。

### hspc v1.6.4 を使用する場合
このパッケージ設定の`コマンドをShell経由で実行する`と、`\文字をエスケープする`をOnにしてください。

# 主な機能と動作
エディタで開いたファイルをコンパイルして、コンパイルエラーをlinterに渡して表示してもらいます。

エディタ上にエラーを協調表示するので、構文エラーや、インクルードするファイルパスのミスがその場でわかります。

`未保存のエディタを解析する`機能で、エディタ編集中の未保存内容を`一時保存用のファイル名`で設定されたファイル名で同じフォルダに保存して、コンパイルします。
このOffにすると、ファイル保存時のみコンパイルします。

`未初期化変数を表示する`をOffにすることで、未初期化変数の情報をlinterに提供しません。

# バグについて
開発中です。もしかすると、不具合がいっぱいあるかもしれません。

## 既知の不具合
- `コマンドをShell経由で実行する`をOnにすると、コマンドの実行に失敗してもエラーを検出することができない。
  - 実行結果は空文字を返すので、これを検出して例外を投げることで通知するようにしました。
- *fix* ファイルパスに空白があると、hspcがソースファイルを見つけられない。
  - ~~空白文字バイナリの変化？~~
  - hspc側の問題でした。hspc v2で解決しました。
- エラーを指摘している文字列が文字化けする。
  - hspc.exeがUTF-8出力に対応していないため、この不具合が発生しています。申し訳ございませんが、解決は未定です。
  - 回避策は、ソースファイルのコードページをShift_JISに固定することです。hspc.exeは、Shift_JISでコンソールに出力しています。

# 使用したコードとライセンス表記

## linter-hsp3
MIT License

Copyright (c) 2017-2020 Honobono

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## [iconv-lite](https://www.npmjs.com/package/iconv-lite)
MIT License

Copyright (c) 2011 Alexander Shtuchkin

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## [encoding.js](https://github.com/polygonplanet/encoding.js)
MIT License

Copyright (c) 2014-2019 Polygon Planet

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## [async-lock](https://www.npmjs.com/package/async-lock)
The MIT License (MIT)

Copyright (c) 2016 Rogier Schouten <github@workingcode.ninja>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## [atom-package-deps](https://www.npmjs.com/package/atom-package-deps)
MIT License

Copyright (c) 2015-2016 steelbrain

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
