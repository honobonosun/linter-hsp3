'use babel'

Model = require './model'
Config = require './config'

module.exports =
  config: Config.config
  activate: ->
    return
  deactivate: ->
    return
  provideLinter: ->
    return {
      name: 'hsp3'
      scope: 'file'
      lintsOnChange: false
      grammarScopes: ['source.hsp3']
      lint: (textEditor) ->
        new Promise (resolve) ->
          resolve Model.lint(textEditor)
    }
