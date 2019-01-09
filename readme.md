# linter-hsp3
hspc.exeを使って、linterにエラーなどを通知するパッケージです。

## パッケージの導入方法
1. このパッケージの前提となるatomパッケージ「[linter](https://atom.io/packages/linter)」をインストールしてください。
2. ターミナル（またはコマンドプロンプト）で、`apm install linter-hsp3`コマンドを実行してください。  
   GUIからインストールする場合、Atomの設定画面「install」タブから「linter-hsp3」を検索して、installしてください。
3. HSP3をインストールしたディレクトリ（つまり、hspcmp.dllがある場所）に、[hspc.exe](http://dev.onionsoft.net/seed/info.ax?id=1392)  を導入してください。
4. linter-hsp3にhspc.exeのパスを設定します。パッケージ詳細画面にある「Compiler Settings」の「Compiler path」にhspc.exeの絶対を設定してください。
5. Atomを再起動します。（または、<kbd>Ctrl-Shift-F5</kbd>キーを押す）

# 主な機能と動作
linter-hsp3は、hspファイルまたは、asファイルを編集するごとに、hspc.exeにコンパイルさせます。コンパイルが失敗したら、linterに通知します。表示はlinterのGUIに委ねられます。

hspc.exeは、コンパイルに成功した場合、axファイルを出力します。このファイルはストレージに保存されます。linter-hsp3を導入すると、hsp,asファイルを保存するたびに、axファイルが作成、保存される場合があることに留意してください。

既定値では、axファイルは「obj」ファイル名で保存されます。

## hspc.exe Dオプションの有効化
hspc.exe version 1.4.1以降には、Dオプションが実装されました。このオプションを有効化するには、パッケージの設定画面「Command option」の一文字オプションに**D**文字を挿入するだけです。

## 入出力の非同期化
linter-hsp3 version 0.1.0以降、hspc.exeとファイルIOの非同期化を行いました。エディタで編集中でも、解析を行います。PCスペック不足で重くなる場合、オプション「未保存のエディタを解析する」のフラグを閉じてください。従来通りに保存時のみ解析を行います。**設定を反映させるには、atomを再起動してください。**

# バグについて
開発中です。もしかすると、不具合がいっぱいあるかもしれません。

## 既知の不具合
* ~~ファイルパスに空白があると、hspcがソースファイルを見つけられない。~~
  * ~~空白文字バイナリの変化？~~
* エラーを指摘している文字列が文字化けする。
  * hspc.exeがUTF-8出力に対応していないため、この不具合が発生しています。申し訳ございませんが、解決は未定です。
  * 回避策は、ソースファイルのコードページをShift_JISに固定することです。hspc.exeは、Shift_JISでコンソールに出力しています。

# 使用したコードとライセンス表記

## linter-hsp3
MIT License  
Copyright (c) 2017-2018 Honobono

## iconv-lite
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
