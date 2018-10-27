module.exports =
  convertToUTF8: (binary) ->
    iconv = require('iconv-lite')
    iconv.decode(new Buffer(binary,'binary'),"Shift_JIS")

  getEditFilepath: ->
    editor = atom.workspace.getActiveTextEditor()
    return unless editor?
    return unless editor.isEmpty()?
    editor.getPath()

  getProjectRoot: ->
    for elm,i in atom.project.getPaths()
      return elm if @getEditFilepath().search(elm.replace(/\\/g,'\\\\')) is 0
    return '' # 見つけられなかったら、空文字を返す。
