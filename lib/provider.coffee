AsyncLock = require 'async-lock'
lock = new AsyncLock()
{CompositeDisposable} = require 'atom'
util = require './util'
hspc = require './hspc'

class Provider
  LOCK_KEY: "linterhsp3"

  constructor: ->
    console.log 'ok provider'
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe('linter-hsp3.compiler', (value) -> util.config.compiler = value)
    @subscriptions.add atom.config.observe('linter-hsp3.option', (value) -> util.config.option = value)

  destructor: ->
    @subscriptions.dispose()

  lint: (editor) ->
    return null if editor.isEmpty()
    return new Promise (resolve, reject) =>
      lock.acquire @LOCK_KEY, ->
        util.mightSaveTmpFile(editor)
        .then(({file, refname}) -> util.exec(file, refname))
        .then(({stdout, file, refname}) -> hspc.lint(stdout, file, refname))
        .then((result) -> resolve(result))
        .catch((err) -> console.error(err))

module.exports = Provider
