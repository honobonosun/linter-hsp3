

class Hsptmp
  count: 0

  constructor: (@editor) ->
    @count++

  destructor: ->
    # hsptmpを保存していれば、削除する。
    @count--

  saveTmpFile: ->

module.exports = Hsptmp
