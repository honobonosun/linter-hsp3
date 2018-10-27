# linter-hsp3
HSP3のリンターもどきです。

## 実装が必要
* commonディレクトリの位置を取得する
  * hspcがcommonの位置を出力する必要がある
* hspcのカレントディレクトリを取得する必要がある

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
