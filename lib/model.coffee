'use babel'

Config = require './config'
Submodel = require './submodel'

module.exports =

  Command: (path) ->
    result = new Array()
    for element in Config.get.lintCommand()
      result.push element.replace(
        /%FILEPATH%/g,
        (match) ->
          return path if match is '%FILEPATH%'
          match
      )
    result

  FindCodepage: (strArray) ->
    for str, index in strArray
      revalue = / Codepage mode : .+ \( (\S+) \)/i.exec(str)
      break if revalue?
    return "Unknown" unless revalue?
    revalue[1]

  claimFullPath: (textEditor, filepath) ->
    path = require 'path'
    fs = require 'fs'
    if path.isAbsolute(filepath) is false
      file = path.resolve(path.dirname(textEditor.getPath()) ,filepath)
      try
        fs.accessSync(file, fs.constants.R_OK)
        return file
      catch
        # todo : common ディレクトリの可能性を探る
        return undefined
    else
      return filepath

  ToFileArray: (file, codepage) ->
    try
      fs = require 'fs'
      if codepage is 'Shift_JIS'
        return Submodel.convertToUTF8(fs.readFileSync(file)).split(/\n/)
      else
        return fs.readFileSync(file).toString().split(/\n/)
    catch error
      console.log "linter-hsp3 file read error."
      console.log error
      return undefined

  excerpt: (str, word) ->
    #if (str.length + word.length) > Config.get.FlapStringLength()
    if word?
      "#{str}(#{word})"
    else
      str

  regexpWordEscape: (str) ->
    str.replace(
      /[\\*+.?{}()\[\]^$-|/]/g
      ()->
        return '\\'+arguments[0]
    )

  nonInitVarMessage: (textEditor, strArray, index) ->
    reval = /#未初期化の変数があります\((.+)\)/.exec(strArray[index])
    return unless reval?
    path = textEditor.getPath()
    {
      skip: 0
      msg: {
        location: {
          file: path
          position: [[0,0],[0,0]]
        }
        severity: 'info'
        excerpt: @excerpt('未初期化の変数があります',reval[1])
      }
    }

  errorParser: (textEditor, strArray, index) ->
    regexp = /(.+)\((\d+)\) : error (\d+) : (.+) \((\d+)行目\)/i
    revalue = regexp.exec(strArray[index])
    return unless revalue?

    revalue2 = /\s*-->\s*(.+)/i.exec(strArray[index+1])
    return unless revalue2?

    return {
      file : revalue[1]
      line : Number(revalue[2]-1)
      word : revalue2[1]
      err : revalue[3]
      excerpt : revalue[4]
      severity : "error"
      description: revalue2[1]
    }

  errorMessage: (textEditor, codepage, strArray, index) ->
    revalue = @errorParser(textEditor, strArray, index)
    return unless revalue?

    # 絶対パスを求める
    filepath = @claimFullPath(textEditor, revalue.file)
    return unless filepath?

    # 問題を起こした文字列を指摘する。
    sourceArray = @ToFileArray(filepath, codepage)
    console.log sourceArray
    sourceLine = sourceArray[revalue.line]
    regexp = new RegExp(@regexpWordEscape(revalue.word),'ig')
    i = sourceLine.search(regexp)
    if i != -1
      n = i + revalue.word.length
    else
      # 問題を起こした文字列が見つからなかったから、行全体を指摘する。
      i = 0
      n = sourceLine.length
    {
      skip: 1
      msg: {
        location: {
          file: revalue.file
          position: [[revalue.line, i], [revalue.line, n]]
        }
        severity: revalue.severity
        excerpt: @excerpt("code:#{revalue.err} #{revalue.excerpt}",revalue.word)
        #description: revalue.description
      }
    }

  stackErrorParser: (textEditor, strArray, index) ->
    regexp = /#スタックが空になっていないマクロタグが1個あります\s+\[(.+)\]/i
    revalue = regexp.exec(strArray[index])
    return unless revalue?
    word = /\s*(.+)/i.exec(strArray[index+1])[1]
    {
      file: @claimFullPath(textEditor, revalue[1])
      line: undefined
      word: word
      excerpt : 'スタックが空になっていないマクロタグがあります'
      severity : 'error'
      description: word
    }

  stackErrorMessage: (textEditor, codepage, strArray, index) ->
    revalue = @stackErrorParser(textEditor, strArray, index)
    return unless revalue?
    {
      skip: 2
      msg: {
        location: {
          file: revalue.file
          position: [[0,0],[0,0]]
        }
        excerpt: @excerpt(revalue.excerpt, revalue.word)
        severity: revalue.severity
        #description: revalue.description
      }
    }

  criticalErrorParser: (textEditor, str) ->
    regexp = [
      /#Error:(.+) \[(.+)] in line (\d+) \[(.+)]/i
      /#Error:(.+) in line (\d+) \[(.+)]/i
      /#スクリプトファイルが見つかりません \[(.+)]/i
      /#Error: in line (\d+) \[(.+)]/i
    ]
    for element, index in regexp
      reval = element.exec(str)
      if reval != null
        break
    if reval?
      switch index
        when 0
          return {
            case : 0
            file : reval[4]
            line : Number(reval[3])-1
            word : reval[2]
            excerpt : reval[1]
            severity : "error"
          }
        when 1
          return {
            case : 1
            file : reval[3]
            line : Number(reval[2])-1
            word : undefined
            excerpt : reval[1]
            severity : "error"
          }
        when 2
          return {
            case : 2
            file : undefined
            line : undefined
            word : reval[1]
            excerpt : "スクリプトファイルが見つかりません"
            severity : "error"
          }
        when 3
          return {
            case : 3
            file : reval[2]
            line : Number(reval[1])-1
            word : undefined
            excerpt : '重大なエラーが検出されています'
            severity : 'error'
          }
    undefined

  criticalErrorMessage: (textEditor, codepage, strArray, index) ->
    revalue = @criticalErrorParser(textEditor, strArray[index])
    return unless revalue?

    if revalue.case is 2
      # "スクリプトファイルが見つかりません"を解析する
      revalue2 = /#Error: in line (\d+) \[(.+)]/i.exec(strArray[index+1])
      console.log revalue2
      line = Number(revalue2[1])-1
      # 絶対パスへ変換
      filepath = @claimFullPath(textEditor, revalue2[2])
      return unless filepath?
      # ソースファイルを配列で取得する
      sourceArray = @ToFileArray(filepath, codepage)
      return unless sourceArray?
      sourceLine = sourceArray[line]
      # 問題の文字列位置を求める
      regexp = new RegExp(@regexpWordEscape(revalue.word),'ig')
      i = sourceLine.search(regexp)
      if i != -1
        n = i + revalue.word.length
      else
        # 問題を起こした文字列が見つからなかったから、行全体を指摘する。
        i = 0
        n = sourceLine.length
      return {
        skip: 2
        msg: {
          location: {
            file: filepath
            position: [[line, i], [line, n]]
          }
          severity: revalue.severity
          excerpt: "#{revalue.word}ファイルが見つかりません"
          #description: revalue.word
        }
      }
    else
      # 絶対パスを取得する
      filepath = @claimFullPath(textEditor, revalue.file)
      return unless filepath?
      # ファイルの内容を配列で取得する
      sourceArray = @ToFileArray(filepath, codepage)
      sourceLine = sourceArray[revalue.line]

      if revalue.word?
        regexp = new RegExp(@regexpWordEscape(revalue.word),'ig')
        i = sourceLine.search(regexp)
        if i != -1
          n = i + revalue.word.length
        else
          # 問題を起こした文字列が見つからなかったから、行全体を指摘する。
          i = 0
          n = sourceLine.length
      else
        i = 0
        n = sourceLine.length
    {
      skip: 1
      msg: {
        location: {
          file: filepath
          position: [[revalue.line, i], [revalue.line, n]]
        }
        severity: revalue.severity
        excerpt: @excerpt(revalue.excerpt, revalue.word)
        #description: revalue.description
      }
    }

  lint: (textEditor) ->
    execFileSync = require('child_process').execFileSync
    convertToUTF8 = require('./submodel').convertToUTF8
    try
      reval = execFileSync(
        Config.get.path()
        @Command(textEditor.getPath())
        {maxBuffer:Config.get.maxLogBuffer()}
      )
    catch error
      atom.notifications.addError(
        "Failed (linter-hsp3)",
        {
          detail: "実行ファイルの起動に失敗しました。",
          dismissable: false
        }
      )
      console.log error
      return null
    strArray = convertToUTF8(reval).split(/\n/)
    console.log strArray

    # コードページを取得する
    codepage = @FindCodepage(strArray)
    console.log codepage
    if codepage is "Unknown"
      codepage = "Shift_JIS"  # とりあえず、Shift_JISとして続行する

    bShow = Config.get.ShowUninitializedVariable()
    msgs = new Array()
    skip = 0
    for str, index in strArray
      if skip > 0
        skip--
        continue
      console.log index,str

      if bShow
        revalue = @nonInitVarMessage(textEditor, strArray, index)
        if revalue?
          skip = revalue.skip
          msgs.push revalue.msg
          continue

      revalue = @errorMessage(textEditor, codepage, strArray, index)
      if revalue?
        skip = revalue.skip
        msgs.push revalue.msg
        continue

      revalue = @criticalErrorMessage(textEditor, codepage, strArray, index)
      if revalue?
        skip = revalue.skip
        if msgs.length > 0
          continue if msgs[msgs.length-1].excerpt == revalue.msg.excerpt
        msgs.push revalue.msg
        continue

      revalue = @stackErrorMessage(textEditor, codepage, strArray, index)
      if revalue?
        skip = revalue.skip
        msgs.push revalue.msg
        continue

      ###

      if bShow
        reval = @nonInitVarMessage(editorPath, str)
        msgs.push reval if reval

      reval = @errorMessage(textEditor, str, strArray[index+1])
      msgs.push reval if reval

      reval = @stackErrorMessage(str, strArray[index+1])
      msgs.push reval if reval

      reval = @criticalErrorMessage(textEditor, str)
      msgs.push reval if reval
      ###

    console.log msgs
    msgs
