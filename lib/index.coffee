config = require './config'
provider = require './provider'

module.exports = linterhsp3 =
  config: config.config
  provider: null

  activate: -> @provider = new provider
  deactivate: -> @provider.destructor()
  provideLinter: ->
    {
      name: 'hsp3'
      scope: 'file'
      lintsOnChange: config.get.lintsOnChange()
      grammarScopes: ['source.hsp3']
      lint: (editor) => @provider.lint(editor)
    }
