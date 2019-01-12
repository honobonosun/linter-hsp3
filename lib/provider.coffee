fs = require 'fs'
path = require 'path'
child_process = require 'child_process'
iconv = require 'iconv-lite'

config = require './config'
Hspc = require './hspc'

class Provider

  @make: (editor, callback) ->
    if editor.isEmpty() || editor.isModified()
      Provider.saveHsptmp editor, (error, file) ->
        if error?
          callback error
        else
          Provider.exec file, (error, result) ->
            if error?
              callback error
            else
              if editor.isEmpty()
                hspc = new Hspc(file, result)
              else
                hspc = new Hspc(file, result, editor.getPath())
              hspc.lint callback
    else
      file = editor.getPath()
      do (editor, file, callback) ->
        Provider.exec file, (error, result) ->
          if error?
            callback error
          else
            hspc = new Hspc(file, result, editor.getPath())
            hspc.lint callback

  # editorの内容を一時ファイルに保存します。
  @saveHsptmp: (editor, callback) ->
    codepage = editor.getEncoding()
    unless iconv.encodingExists(codepage)
      atom.notifications.addWarning(
        'linter-hsp3',
        {description: "This is not support #{codepage} codepage."}
      )
      callback new Error("This is not support #{codepage} codepage.")
      return
    binary = iconv.encode(editor.getBuffer().getText(), codepage)
    if editor.isEmpty()
      # どこにも保存されていないなら、ユーザーディレクトリに。
      userProfile = process.env.USERPROFILE ? null
      unless userProfile?
        callback new Error('non userProfile directory.')
        return
      else
        file = path.join(userProfile, 'hsptmp')
        console.log 'save hsptmp', file if atom.inDevMode()
        callback null, file
    else
      # ファイルパスが有るなら、そのディレクトリに。
      file = path.join(path.dirname(editor.getPath()), 'hsptmp')
      console.log 'save hsptmp', file if atom.inDevMode()
    do (file, binary) ->
      fs.writeFile file, binary, (err) ->
        if err?
          callback err
        else
          callback null, file

  @exec: (file, callback) ->
    command = (file) ->
      config.get.lintCommand().map (str) -> str.replace(/%FILEPATH%/g, file)
    option =
      cwd: path.dirname(file)
      maxBuffer: config.get.maxLogBuffer()
      encoding: 'buffer'  # 最初からbinaryで出力してもらう。
    do (file, option, callback) ->
      if config.get.UsekillQuiotations()
        cmd = "#{config.get.path()} #{command(file).join(' ').replace(/\""/g, "")}"
        child_process.exec cmd, option, (error, stdout, stderr) ->
          callback error, stdout
      else
        child_process.execFile config.get.path(), command(file), option, (error, stdout, stderr) ->
          callback error, stdout

module.exports = Provider
