fs = require 'fs'
path = require 'path'
child_process = require 'child_process'
{promisify} = require 'util'
iconv = require 'iconv-lite'

class Util
  # Provider.coffee側で値を取得する
  @config =
    compiler: null
    option: null

  ###
  @summary editorが編集済みなら、hsptmpを保存してそのパスを返す。
           未編集なら editor.getPath() の値を返す。
  @return <Object>{file: <String>, refname: <String>} - どちらもフルパスで返る
  ###
  @mightSaveTmpFile: (editor) -> new Promise (resolve, reject) ->
    if editor.isModified()
      codepage = editor.getEncoding()
      reject new Error("not support #{codepage}.") unless iconv.encodingExists(codepage)

      file = path.join(path.dirname(editor.getPath()), 'hsptmp')
      data = new Uint8Array(iconv.encode(editor.getBuffer().getText(), codepage))
      refname = editor.getPath()

      do(file, data, refname) ->
        promisify(fs.writeFile)(file, data)
        .then(-> resolve({file: file, refname: refname}))
        .catch((err) -> reject(err))
    else
      resolve({file: editor.getPath()})

  @exec: (file, refname) -> new Promise (resolve, reject) =>
    args = @config.compiler.LintCommand.map((str) -> str.replace(/%FILEPATH%/g, file))
    option =
      cwd: path.dirname(file)
      maxBuffer: @config.compiler.maxLogBuffer
      encoding: 'buffer'  # 最初からbinaryで出力してもらう。

    do(file, args, option, refname) =>
      if @config.compiler.UsekillQuiotations
        cmd = "#{@config.compiler.path} #{args.join(' ').replace(/\""/g, "")}"
        promisify(child_process.exec)(cmd, option)
        .then(({stdout}) -> resolve({
          stdout:iconv.decode(stdout, 'Shift_JIS')
          file: file
          refname: refname
        }))
        .catch((err) -> reject(err))
      else
        promisify(child_process.execFile)(@config.compiler.path, args, option)
        .then(({stdout}) -> resolve({
          stdout:iconv.decode(stdout, 'Shift_JIS')
          file: file
          refname: refname
        }))
        .catch((err) -> reject(err))

module.exports = Util
