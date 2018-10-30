# linter-hsp3
HSP3のリンターもどきです。

## 開発について
パッケージ開発者は、**node.js**、**npm** と **python 2.7系** のインストールが必要です。
インストール後、パスを通してください。

### 導入方法
パッケージが、atom.ioで公開されている場合、apmコマンドでインストールできます。こちらを推奨します。

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
