import { Mutex } from './mutex.js'

// =============================================================================
// Types
// @ts-check

/**
 * @typedef {object} SidebarItem
 *
 * @property {number} id The id of this specific sidebar item. Valid for a browser session
 * @property {string} title The title of the sidebar item, generally the webpage title
 * @property {string} iconUrl The website's favicon
 * @property {string} webviewUrl The url of the website to navigate to
 */

// =============================================================================
// Functions

const storageMutex = new Mutex()

/**
 * @returns {Promise<{ sidebaritems: SidebarItem[] }>}
 */
async function getFromStorage() {
  const { unlock } = await storageMutex.lock()

  const storage = await browser.storage.local.get('sidebaritems')

  unlock()
  return storage
}

async function spawnExistingSidebarItems(storage) {
  const { unlock } = await storageMutex.lock()
  let { sidebaritems: sidebarItems } = await getFromStorage()

  if (typeof sidebarItems === 'undefined') {
    sidebarItems = []
  }

  for (let i = 0; i < sidebarItems.length; i++) {
    const item = sidebarItems[i]
    const id = await browser.sidebars.add(item)

    sidebarItems[i].id = id
  }

  storage.sidebaritems = sidebarItems
  await browser.storage.local.set(storage)
  unlock()
}

/**
 * @param {number} idToRemove The id of the sidebar item you wish to remove
 */
async function removeSidebarItems(idToRemove) {
  const { unlock } = await storageMutex.lock()
  let storage = await getFromStorage()

  storage.sidebaritems = storage.sidebaritems.filter(
    (item) => item.id !== idToRemove
  )

  await browser.storage.local.set(storage)
  unlock()
}

// =============================================================================
// Init logic

browser.sidebars.add({
  title: 'Add Shortcut to Sidebar',
  iconUrl: 'plus.svg',
  webviewUrl: 'index.html',
  isBottom: true,
})

getFromStorage().then(spawnExistingSidebarItems)

browser.sidebars.onRemove.addListener((itemId) => removeSidebarItems(itemId))
