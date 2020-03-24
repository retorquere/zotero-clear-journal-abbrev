declare const Zotero: any
declare const Components: any

const marker = 'ClearJournalAbbrevMonkeyPatched'

function patch(object, method, patcher) {
  if (object[method][marker]) return
  object[method] = patcher(object[method])
  object[method][marker] = true
}

const seconds = 1000

function flash(title, body = null, timeout = 8) {
  try {
    const pw = new Zotero.ProgressWindow()
    pw.changeHeadline(`Clear Journal Abbrev: ${title}`)
    if (!body) body = title
    if (Array.isArray(body)) body = body.join('\n')
    pw.addDescription(body)
    pw.show()
    pw.startCloseTimer(timeout * seconds)
  } catch (err) {
    Zotero.logError(err)
  }
}

const ClearJournalAbbrev = Zotero.ClearJournalAbbrev || new class { // tslint:disable-line:variable-name
  private initialized: boolean = false

  constructor() {
    window.addEventListener('load', event => {
      this.init().catch(err => Zotero.logError(err))
    }, false)
  }

  private async init() {
    if (this.initialized) return

    flash('Zotero is starting, please wait')

    await Zotero.Schema.initializationPromise
    this.initialized = true
  }

  public async clear() {
    if (!this.initialized) {
      flash('Zotero is still starting up, please wait')
      return
    }

    const items = Zotero.getActiveZoteroPane().getSelectedItems(false)
    if (!items) return
    for (const item of items) {
      try {
        item.setField('journalAbbreviation', '')
        await item.saveTx()
      } catch (err) {
        Zotero.logError(err)
      }
    }
  }
}

export = ClearJournalAbbrev

// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete require.cache[module.id]
