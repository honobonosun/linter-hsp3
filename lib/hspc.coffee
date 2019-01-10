fs = require 'fs'
path = require 'path'
child_process = require 'child_process'
iconv = require 'iconv-lite'

config = require './config'

class Hspc

  constructor: (@file, @stdout, @refname = null) ->
    console.log 'hspc', @file, @stdout if atom.inDevMode()

  refFile: (file) ->
    console.log 'refFile', file, path.basename(file), @refname if atom.inDevMode()
    if !@refname
      file
    else
      if path.basename(file) is 'hsptmp' then @refname else file

  lint: (callback) ->
    cmpResult = iconv.decode(@stdout, 'Shift_JIS').split(/\n/)
    console.log 'hspc decode result', cmpResult if atom.inDevMode()

    curdir = do (cmpResult) ->
      for str in cmpResult
        result = / Current directory : (.+)/.exec(str)
        break if result?
      if result? then result[1] else null

    outName = do (cmpResult) ->
      for str in cmpResult
        result = / Output file : (.+)/.exec(str)
        break if result?
      if result? then result[1] else null

    commondir = do (cmpResult) ->
      for str in cmpResult
        result = / Common directory : (.+)/.exec(str)
        break if result?
      if result? then result[1] else null

    codepage = do (cmpResult) ->
      for str in cmpResult
        result = / Codepage mode : .+ \( (\S+) \)/i.exec(str)
        break if result?
      if result? then result[1] else "Unknown"

    console.log curdir, outName, commondir, codepage if atom.inDevMode()

    readFile = (file, codepage, callback) ->
      console.log 'read', file if atom.inDevMode()
      fs.readFile file, (err, data) ->
        if err?
          callback err
        else
          if codepage is 'Shift_JIS'
            callback null, iconv.decode(data, 'Shift_JIS').split(/\n/)
          else
            callback null, iconv.decode(data, 'utf-8').split(/\n/)

    getWordPos = (file, codepage, word, row, callback) ->
      readFile file, codepage, (err, data) ->
        return callback(err) if err?
        regWord = word.replace(/[*+.?^$\-\|\/\\¥()\[\]{}]/g, (word) -> '\\' + word) # 正規表現をエスケープする
        column = data[row].search(RegExp(regWord, 'ig'))
        if column >= 0
          callback null, [[row, column], [row, column + word.length]]
        else
          callback null, [[row, column], [row, data[row].length]]

    claimFullPath = (file, curdir, commondir, callback) ->
      console.log file, curdir, commondir if atom.inDevMode()
      return callback(null, file) if path.isAbsolute(file)
      if config.get.path() is 'wine'
        console.log 'wine mode' if atom.inDevMode()
        # wine環境の場合、Iオプションの値をwinepathへ変換します。
        child_process.execFile(
          'winepath',
          ['--unix', "#{curdir}", "#{commondir}"],
          {maxBuffer: config.get.maxLogBuffer(), encoding: 'utf8'},
          (error, stdout, stderr) ->
            console.log error, stdout, stderr if atom.inDevMode()
            return callback(error) if error?
            result = /(.+)\n(.+)/.exec(stdout)
            curdir = result[1]
            commondir = result[2]
            # カレントディレクトリを調べる。
            do (file, curdir, commondir, callback) ->
              child_process.execFile(
                'winepath',
                ['--unix', "#{file}"],
                {cwd: "#{curdir}", encoding: 'utf8'},
                (error, stdout, stderr) ->
                  console.log error, stdout, stderr if atom.inDevMode()
                  return callback(error) if error?
                  file2 = stdout
                  fs.access file2, fs.constants.R_OK, (err) ->
                    if err?
                      # コモンディレクトリを調べる。
                      child_process.execFile(
                        'winepath',
                        ['--unix', "#{file}"],
                        {cwd: "#{commondir}", encoding: 'utf8'},
                        (error, stdout, stderr) ->
                          console.log error, stdout, stderr if atom.inDevMode()
                          return callback(error) if error?
                          file3 = stdout
                          fs.access file3, fs.constants.R_OK, (err) ->
                            if err?
                              callback err
                            else
                              console.log 'コモンディレクトリで解決', file3 if atom.inDevMode()
                              callback null, file3
                      )
                    else
                      console.log 'カレントディレクトリで解決', file2 if atom.inDevMode()
                      callback null, file2
              )
        )
      else
        console.log 'windows mode' if atom.inDevMode()
        # hspc.exeのカレントディレクトリから調べる。
        file2 = path.resolve(curdir, file)
        do (file, file2) ->
          fs.access file2, fs.constants.R_OK, (err) ->
            if err?
              file3 = path.resolve(commondir, file)
              do (file3) ->
                # コモンディレクトリを調べる。
                fs.access file3, fs.constants.R_OK, (err) ->
                  if err?
                    callback err
                  else
                    callback null, file3
            else
              callback null, file2

    fShowNonInitVar = config.get.ShowUninitializedVariable()

    msgs = new Array()  # iterable
    skip = 0
    for string, index in cmpResult
      if skip > 0
        skip--
        continue
      console.log index, string if atom.inDevMode() if atom.inDevMode()

      # 未初期化変数の情報
      if fShowNonInitVar
        result = do (string) =>
          result = /#未初期化の変数があります\((.+)\)/.exec(string)
          return unless result?
          {
            skip: 0
            msg:
              location:
                file: @refFile(@file)
                position: [[0,0],[0,0]]
              severity: 'info'
              excerpt: "未初期化の変数があります(#{result[1]})"
          }
        if result?
          {skip, msg} = result
          msgs.push msg
          continue

      # スタックが空になっていないマクロタグ
      result = do (string, index, cmpResult) ->
        result = /#スタックが空になっていないマクロタグが1個あります\s+\[(.+)\]/i.exec(string)
        return unless result?
        {
          skip: 2
          msg:
            location:
              file: result[1]
              position: [[0,0],[0,0]]
            severity: 'error'
            excerpt: 'スタックが空になっていないマクロタグがあります'
            description: /\s*(.+)/i.exec(cmpResult[index+1])[1]
        }
      if result?
        {skip, msg} = result
        msgs.push msg
        continue

      # `file(line) : error (n) : msg`
      result = do (string, index, cmpResult, codepage, curdir, commondir) =>
        result = /(.+)\((\d+)\) : error (\d+) : (.+) \((\d+)行目\)/i.exec(string)
        return unless result?
        result2 = /\s*-->\s*(.+)/i.exec(cmpResult[index+1])
        return unless result2?
        console.log result, result2 if atom.inDevMode()
        msg = do (result, result2, codepage, curdir, commondir) => new Promise (resolve, reject) =>
          claimFullPath result[1], curdir, commondir, (error, file) =>
            return reject(Error(error)) if error?  # todo: rejectした時の動作は未定義。
            # 問題の文字列を探す
            do (resolve, reject, file, codepage, result, result2) =>
              console.log file if atom.inDevMode()
              getWordPos file, codepage, result2[1], Number(result[2])-1, (err, position) =>
                return reject(Error(err)) if err?
                resolve {
                  location:
                    file: @refFile(file)
                    position: position
                  severity: 'error'
                  excerpt: "err:#{result[3]} #{result[4]}"
                  description: "`#{result2[1]}`"
                }
        {
          skip: 1
          msg: msg
        }
      if result?
        {skip, msg} = result
        msgs.push msg
        continue

      # `スクリプトファイルが見つかりません [file]`
      result = do (string, index, cmpResult, codepage, curdir, commondir) =>
        result = /#スクリプトファイルが見つかりません \[(.+)]/.exec(string)
        return unless result?
        result2 = /#Error: in line (\d+) \[(.+)]/i.exec(cmpResult[index+1])
        return unless result2?
        msg = do (result, result2, codepage, curdir, commondir) => new Promise (resolve, reject) =>
          claimFullPath result2[2], curdir, commondir, (error, file) =>
            return reject(error) if error?
            do (resolve, reject, file, codepage, result, result2) =>
              getWordPos file, codepage, result[1], Number(result2[1])-1, (err, position) =>
                return reject(err) if err?
                resolve {
                  location:
                    file: @refFile(file)
                    position: position
                  severity: 'error'
                  excerpt: "#{result[1]}ファイルが見つかりません"
                }
        {
          skip: 2
          msg: msg
        }
      if result?
        {skip, msg} = result
        msgs.push msg
        continue

      # `#Error:msg [???] in line n [???]`
      result = do (string, index, codepage, curdir, commondir) =>
        result = /#Error:(.+) \[(.+)\] in line (\d+) \[(.+)\]/.exec(string)
        return unless result?
        console.log result if atom.inDevMode()
        msg = do (result, codepage, curdir, commondir) => new Promise (resolve, reject) =>
          claimFullPath result[4], curdir, commondir, (error, file) =>
            return reject(error) if error?
            do (resolve, reject, file, codepage, result) =>
              getWordPos file, codepage, result[2], Number(result[3])-1, (err, position) =>
                return reject(err) if err?
                resolve {
                  location:
                    file: @refFile(file)
                    position: position
                  severity: 'error'
                  excerpt: "#{result[1]}"
                  description: "`#{result[2]}`"
                }
        {
          skip: 1
          msg: msg
        }
      if result?
        {skip, msg} = result
        msgs.push msg
        continue

      # `#Error:msg in line n [file]`
      result = do (string, index, codepage, curdir, commondir) =>
        result = /#Error:(.+) in line (\d+) \[(.+)\]/.exec(string)
        return unless result?
        console.log result if atom.inDevMode()
        msg = do (result, codepage, curdir, commondir) => new Promise (resolve, reject) =>
          claimFullPath result[3], curdir, commondir, (error, file) =>
            return reject(error) if error?
            do (resolve, reject, file, codepage, result) =>
              getWordPos file, codepage, '', Number(result[2])-1, (err, position) =>
                return reject(err) if err?
                resolve {
                  location:
                    file: @refFile(file)
                    position: position
                  severity: 'error'
                  excerpt: "#{result[1]}"
                }
        {
          skip: 1
          msg: msg
        }
      if result?
        {skip, msg} = result
        msgs.push msg
        continue

      # `#Error: in line n [file]`
      result = do (string, index, codepage, curdir, commondir) =>
        result = /#Error: in line (\d+) \[(.+)]/.exec(string)
        return unless result?
        console.log result if atom.inDevMode()
        msg = do (result, codepage, curdir, commondir) => new Promise (resolve, reject) =>
          claimFullPath result[2], curdir, commondir, (error, file) =>
            return reject(error) if error?
            do (resolve, reject, file, codepage, result) =>
              getWordPos file, codepage, '', Number(result[1])-1, (err, position) =>
                return reject(err) if err?
                resolve {
                  location:
                    file: @refFile(file)
                    position: position
                  severity: 'error'
                  excerpt: "重大なエラーが検出されています"
                }
        {
          skip: 1
          msg: msg
        }
      if result?
        {skip, msg} = result
        msgs.push msg
        continue

      # `#関数が定義されていません [identifier]`
      result = do (string, index, codepage, curdir, commondir) =>
        result = /#関数が定義されていません \[(.+)\]/.exec(string)
        return unless result?
        result2 = /(.+)\((\d+)\) : error (\d+) : 致命的なエラーです \((\d+)行目\)/.exec(cmpResult[index+1])
        return unless result2
        console.log result, result2 if atom.inDevMode()
        msg = do (result, result2, codepage, curdir, commondir) => new Promise (resolve, reject) =>
          claimFullPath result2[1], curdir, commondir, (error, file) =>
            return reject(error) if error?
            do (resolve, reject, file, codepage, result, result2) =>
              getWordPos file, codepage, result[1], Number(result2[2])-1, (err, position) =>
                return reject(err) if err?
                resolve {
                  location:
                    file: @refFile(file)
                    position: position
                  severity: 'error'
                  excerpt: '関数が定義されていません'
                  description: "`#{result[1]}`"
                }
        {
          skip: 1
          msg: msg
        }
      if result?
        {skip, msg} = result
        msgs.push msg
        continue

    Promise.all(msgs)
    .then((values) -> callback null, values)
    .catch((error) -> console.error error)

module.exports = Hspc
