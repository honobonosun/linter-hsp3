config = require './config'
provider = require './provider'

module.exports = linterhsp3 =
  config: config.config

  activate: ->

  deactivate: ->

  provideLinter: ->
    {
      name: 'hsp3'
      scope: 'file'
      lintsOnChange: true
      grammarScopes: ['source.hsp3']
      lint: (editor) ->
        new Promise (resolve, reject) ->
          provider.make editor, (error, result) ->
            if error?
              reject error
            else
              resolve result
    }
