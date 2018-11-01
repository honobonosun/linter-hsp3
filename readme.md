# linter-hsp3
hspc.exeを使って、linterにエラーなどを通知するパッケージです。

## パッケージの導入方法
1. このパッケージの前提となるatomパッケージの [linter](https://atom.io/packages/linter) もしくは、[atom-ide-ui](https://ide.atom.io/) または、[Nuclide](https://nuclide.io/) をインストールしてください。Atomに詳しくない場合、atom-ide-uiを推奨します。
2. apmを使用する場合、以下のコマンドを実行してください。  
   ```bash
   $ apm install linter-hsp3
   ```
   GUIからインストールする場合、Atomの設定画面「install」項目から「linter-hsp3」を検索して、installしてください。
3. HSP3をインストールしたディレクトリ（つまり、hspcmp.dllがある場所）に、[hspc.exe](http://dev.onionsoft.net/seed/info.ax?id=1392)  を導入してください。
4. linter-hsp3にhspc.exeのパスを設定します。パッケージ詳細画面にある「Compiler Settings」の「Compiler path」にhspc.exeの絶対を設定してください。
5. Atomを再起動します。（または、<kbd>Ctrl-Shift-F5</kbd>キーを押す）

## 主な機能と動作
linter-hsp3は、hspファイルまたは、asファイルを保存（<kbd>Ctrl-s</kbd>）するごとに、hspc.exeにコンパイルさせます。コンパイルが失敗したら、linterに通知します。表示はlinterのGUIに委ねられます。

hspc.exeは、コンパイルに成功した場合、axファイルを出力します。このファイルはストレージに保存されます。linter-hsp3を導入すると、hsp,asファイルを保存するたびに、axファイルが作成、保存される場合があることに留意してください。

既定値では、axファイルは「obj」ファイル名で保存されます。

hspc.exeのバージョン1.4.1以降には、Dオプションが実装されました。このオプションを有効化するには、パッケージの設定画面「Command option」の一文字オプションに**D**文字を挿入するだけです。

## パッケージ開発について
パッケージ開発者は、**node.js**、**npm** と **python 2.7系** のインストールが必要です。
インストール後、パスを通してください。

### 導入方法
パッケージが、atom.io/packages で公開されている場合、apmコマンドでインストールできます。こちらを推奨します。

リポジトリからAtomへパッケージを有効化するには、以下の手順を実行します。

1. リポジトリをクローンして、カレントディレクトリをlinter-hsp3へ移動します。
2. `npm install`を実行します。
3. 成功したら、`apm link`を実行します。これで完了です。

### 導入解除方法
1. クローンしたディレクトリへカレントディレクトリを移動します。
2. `apm unlink`を実行します。成功すると、Atomからパッケージがアンインストールされます。
3. ディレクトリが不要でしたら、削除してください。これで完了です。

## バグについて
開発中です。不具合いっぱいです。

### 既知の不具合
* ファイルパスに空白があると、hspcがソースファイルを見つけられない。
  * 空白文字バイナリの変化？
* エラーを指摘している文字列が文字化けする。
  * hspc.exeがUTF-8出力に対応していないため、この不具合が発生しています。申し訳ございませんが、解決は未定です。
  * 回避策は、ソースファイルのコードページをShift_JISに固定することです。hspc.exeは、Shift_JISでコンソールに出力しています。

## 使用したコードとライセンス表記

### linter-hsp3
MIT License  
Copyright (c) 2017-2018 Honobono

### iconv-lite
MIT License  
<https://www.npmjs.com/package/iconv-lite>

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
