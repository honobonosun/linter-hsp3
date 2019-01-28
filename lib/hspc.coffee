fs = require 'fs'
path = require 'path'
{promisify} = require 'util'
iconv = require 'iconv-lite'
encoding = require 'encoding-japanese'
config = require './config'

class Hspc
  @regexps:
    nonFreeStack:   [/#スタックが空になっていないマクロタグが1個あります\s+\[(.+)\]/, /\s*(.+)/i]
    nonFindFile:    [/#(スクリプトファイルが見つかりません) \[(.+)]/, /#Error: in line (\d+) \[(.+)]/i]
    nonDefined:     [/#(?!Error)(.+せん) \[(.+)\]/, /(.+)\((\d+)\) : error (\d+) : 致命的なエラーです \((\d+)行目\)/]
    syntaxError:    [/(.+)\((\d+)\) : error (\d+) : (.+) \((\d+)行目\)/i, /\s*-->\s*(.+)/i]
    criticalError1: [/#Error:(.+) \[(.+)\] in line (\d+) \[(.+)\]/]
    criticalError2: [/#Error:(.+) in line (\d+) \[(.+)\]/]
    criticalError3: [/#Error: in line (\d+) \[(.+)]/]

  @getHspcPrm: (stdout) ->
    result = / Current directory : (.+)/g.exec(stdout)
    curdir = result?[1] ? null
    result = / Output file : (.+)/g.exec(stdout)
    outName = result?[1] ? null
    result = / Common directory : (.+)/g.exec(stdout)
    commondir = result?[1] ? null
    result = / Codepage mode : .+ \( (\S+) \)/ig.exec(stdout)
    codepage = result?[1] ? null
    # hspcの実装待ち
    # result = / refname : (.+)/ig.exec(stdout)
    refname = null
    {curdir, outName, commondir, codepage, refname}

  # object = {origin, refname, hspc}
  @refname: (object, file) -> new Promise (resolve, reject) ->
    if object.origin is file
      object.file = object.refname ? object.origin
      return resolve(object)
    else
      f2 = path.resolve(object.hspc.curdir, file)
      do(f2) ->
        promisify(fs.access)(f2, fs.constants.R_OK)
        .then(
          ->
            object.file = f2
            resolve(object)
          ->
            f3 = path.resolve(object.hspc.commondir, file)
            do(f3) ->
              promisify(fs.access)(f3, fs.constants.R_OK)
              .then(
                object.file = f3
                resolve(object)
              ).catch((err) -> reject(err))
        ).catch((err) -> reject(err))

  # object = {file, word, row}
  @getWordPosition: (object) -> new Promise (resolve, reject) ->
    promisify(fs.readFile)(object.file)
    .then( (data) ->
      # コードページを取得して正しい文字列を求める
      codepage = encoding.detect(data)
      if iconv.encodingExists(codepage)
        data = iconv.decode(data, codepage).split(/\n/)
      else
        return reject(new Error('Not support codepage', {codepage: codepage}))
      # 文字の位置を求める
      if object.word?
        regWord = object.word.replace(/[*+.?^$\-\|\/\\¥()\[\]{}]/g, (word) -> '\\' + word) # 正規表現をエスケープする
        if data[object.row]?
          column = data[object.row].search(RegExp(regWord, 'ig'))
          if column >= 0
            object.position = [[object.row, column], [object.row, column + object.word.length]]
            return resolve(object)
          else
            object.position = [[object.row, 0], [object.row, data[object.row].length]]
            return resolve(object)
        else
          return reject(new Error('Can\'t use line', {raw: data, row: object.row}))
      else
        if object.row?
          object.position = [[object.row, 0], [object.row, data[object.row].length]]
          return resolve(object)
        else
          object.position = [[0, 0], [0, data[0].length]]
          return resolve(object)
    ).catch((err) -> reject(err))

  @lint: (stdout, file, refname) => new Promise (resolve, reject) =>
    console.log 'lint', stdout
    hspcPrm = @getHspcPrm(stdout)
    console.log 'hspcPrm', hspcPrm

    fShowNonInitVar = config.get.ShowUninitializedVariable()
    promises = new Array
    skip = 0
    strSplit = stdout.split(/\n/)
    console.log strSplit
    for string, index in strSplit
      if skip > 0
        skip--
        continue

      if fShowNonInitVar
        f = refFile ? file
        result = @noErrorNonInitVar(string, f)
        if result?
          {skip, msg} = result
          promises.push msg
          continue

      result = @getMessage(strSplit, index, file, refname, hspcPrm)
      if result?
        {skip, msg} = result
        promises.push msg
        continue

    Promise.all(promises)
    .then((results) -> resolve(results))
    .catch((err) -> reject(err))

  @noErrorNonInitVar: (string, file) ->
    result = /#未初期化の変数があります\((.+)\)/.exec(string)
    return unless result?
    {
      skip: 0
      msg:
        location:
          file: file
          position: [[0,0],[0,0]]
        severity: 'info'
        excerpt: "未初期化の変数があります(#{result[1]})"
    }

  @messageLexer: (strSplit, index) =>
    results = new Array
    for key of @regexps
      for regexp, i in @regexps[key]
        i = Number(i)
        result = regexp.exec(strSplit[index+i])
        break unless result?
        results.push result
      break if results.length > 0
    if results.length > 0 then {key, results} else null

  @getMessage: (strSplit, index, origin, refname, hspcPrm) =>
    object = @messageLexer(strSplit, index)
    return null unless object?
    skip = 0
    object.origin = origin
    object.refname = refname
    object.hspc = hspcPrm
    console.log object
    switch object.key
      when 'nonFreeStack'
        skip = 2
        msg = do (object) => new Promise (resolve, reject) =>
          @refname(object, object.results[0][1])
          .then((object) =>
            @getWordPosition(object)
          ).then((object) ->
            resolve(
              location:
                file: object.file
                position: object.position
              severity: 'error'
              excerpt: 'スタックが空になっていないマクロタグがあります'
              description: "`#{object.results[1][1]}`"
            )
          )

      when 'nonFindFile'
        skip = 2
        msg = do (object) => new Promise (resolve, reject) =>
          @refname(object, object.results[1][2])
          .then((object) =>
            object.word = object.results[0][2]
            object.row = Number(object.results[1][1])-1
            @getWordPosition(object)
          ).then((object) ->
            resolve(
              location:
                file: object.file
                position: object.position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
              description: "`#{object.word}`"
            )
          ).catch((err) -> reject(err))

      when 'nonDefined'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          @refname(object, object.results[1][1])
          .then((object) =>
            object.word = object.results[0][2]
            object.row = Number(object.results[1][2])-1
            @getWordPosition(object)
          ).then((object) ->
            resolve(
              location:
                file: object.file
                position: object.position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
              description: "err:#{object.results[1][3]} `#{object.word}`"
            )
          ).catch((err) -> reject(err))

      when 'syntaxError'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          @refname(object, object.results[0][1])
          .then((object) =>
            object.word = object.results[1][1]
            object.row = Number(object.results[0][2])-1
            @getWordPosition(object)
          ).then((object)->
            resolve(
              location:
                file: object.file
                position: object.position
              severity: 'error'
              excerpt: "#{object.results[0][4]}"
              description: "err:#{object.results[0][3]} `#{object.word}`"
            )
          ).catch((err) -> reject(err))

      when 'criticalError1'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          @refname(object, object.results[0][4])
          .then((object) =>
            object.word = object.results[0][2]
            object.row = Number(object.results[0][3])-1
            @getWordPosition(object)
          ).then((object) ->
            resolve(
              location:
                file: object.file
                position: object.position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
              description: "`#{object.word}`"
            )
          ).catch((err) -> reject(err))

      when 'criticalError2'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          @refname(object, object.results[0][3])
          .then((object) =>
            object.row = Number(object.results[0][2])-1
            @getWordPosition(object)
          ).then((object) ->
            resolve(
              location:
                file: object.file
                position: object.position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
            )
          ).catch((err) -> reject(err))

      when 'criticalError3'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          @refname(object, object.results[0][2])
          .then((object) =>
            object.row = Number(object.results[0][1])-1
            @getWordPosition(object)
          ).then((object) ->
            resolve(
              location:
                file: object.file
                position: object.position
              severity: 'error'
              excerpt: '重大なエラーが検出されています'
            )
          )

    {skip, msg}

  ###
  @getMessage: (strSplit, index, origin, refname, hspcPrm) =>
    object = @errorLexer(strSplit, index)
    return null unless object?
    skip = 0
    object.origin = origin
    object.refname = refname
    object.hspc = hspcPrm
    console.log object
    switch object.key
      #when 'nonInitVar'
      #when 'nonFreeStack'
      when 'nonFindFile'
        skip = 2
        msg = do (object) => new Promise (resolve, reject) =>
          word = object.results[0][2]
          row = Number(object.results[1][1])-1
          @getWordPosition(object.origin, word, row)
          .then((position) ->
            resolve(
              location:
                file: object.refname ? object.origin
                position: position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
              description: "`#{word}`"
            )
          ).catch((err) -> reject(err))

      when 'nonDefined'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          word = object.results[0][2]
          row = Number(object.results[1][2])-1
          @getWordPosition(object.origin, word, row)
          .then((position) ->
            resolve(
              location:
                file: object.refname ? object.origin
                position: position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
              description: "err:#{object.results[1][3]} `#{word}`"
            )
          ).catch((err) -> reject(err))

      when 'syntaxError'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          word = object.results[1][1]
          row = Number(object.results[0][2])-1
          @getWordPosition(object.origin, word, row)
          .then((position) ->
            resolve(
              location:
                file: object.refname ? object.orig
                position: position
              severity: 'error'
              excerpt: "#{object.results[0][4]}"
              description: "err:#{object.results[0][3]} `#{word}`"
            )
          ).catch((err) -> reject(err))

      when 'criticalError1'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          word = object.results[0][2]
          row = Number(object.results[0][3])-1
          @getWordPosition(object.file, word, row)
          .then((position) ->
            resolve(
              location:
                file: object.refname ? object.origin
                position: position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
              description: "`#{word}`"
            )
          ).catch((err) -> reject(err))

      when 'criticalError2'
        skip = 1
        msg = do (object) => new Promise (resolve, reject) =>
          row = Number(object.results[0][2])-1
          @getWordPosition(object.origin, null, row)
          .then((position) ->
            resolve(
              location:
                file: object.refname ? object.origin
                position: position
              severity: 'error'
              excerpt: "#{object.results[0][1]}"
            )
          ).catch((err) -> reject(err))

      #when 'criticalError3'

    return {skip, msg}
  ###

module.exports = Hspc
