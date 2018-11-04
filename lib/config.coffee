module.exports =
  config:

    compiler:
      order: 1
      title: 'Compiler Settings'
      type: 'object'
      properties:

        path:
          order: 1
          title: 'Compiler path'
          description: '使用するコンパイラを絶対パスで指定してください。'
          type: 'string'
          default: 'C:/hsp35/hspc.exe'

        LintCommand:
          order: 2
          title: 'Command option'
          description: 'コマンド オプション'
          type: 'array'
          default: ['-oobj', '-CaEI', '%FILEPATH%']

        maxLogBuffer:
          order: 3
          description: 'コンパイラの返信受取バッファサイズ(byte)\n
                        バッファサイズが足りなければ、返信の受け取りは失敗します。'
          type: "integer"
          default: 204800
          minimum: 204800
          maximum: null

        UsekillQuiotations:
          order: 4
          title: 'Delete quotation character'
          description: 'ソースファイルパスにダブルクオーテーションを付けない。'
          type: 'boolean'
          default: true

    option:
      order: 2
      title: "Package Option Settings"
      type: 'object'
      properties:

        ShowUninitializedVariable:
          order: 1
          title: '未初期化変数の表示'
          type: 'boolean'
          default: true

  get:
    replace: (arr) ->
      return unless arr?

      subModel = require './submodel'
      result = new Array()
      for element,i in arr
        result.push element.replace(
          /%FILEPATH%|%PROJECT%/g,
          (match) ->
            return subModel.getEditFilepath() if match is '%FILEPATH%'
            return subModel.getProjectRoot() if match is '%PROJECT%'
            match
        )
      result

    path: ->
      atom.config.get('linter-hsp3.compiler').path
    lintCommand: ->
      atom.config.get('linter-hsp3.compiler').LintCommand
    maxLogBuffer: ->
      atom.config.get('linter-hsp3.compiler').maxLogBuffer
    UsekillQuiotations: ->
      atom.config.get('linter-hsp3.compiler').UsekillQuiotations

    ShowUninitializedVariable: ->
      atom.config.get('linter-hsp3.option').ShowUninitializedVariable
