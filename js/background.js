import { MessageTypeValues } from './message.js'
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

/**
 * This is an incomplete version of {@link SidebarItem} intended for sending
 * creation data around with. Currently it only excludes `id`.
 *
 * @typedef {object} SidebarItemData
 *
 * @property {string} title The title of the sidebar item, generally the webpage title
 * @property {string} iconUrl The website's favicon
 * @property {string} webviewUrl The url of the website to navigate to
 */

// =============================================================================
// Functions

const storageMutex = new Mutex()

/**
 * @returns {Promise<{ sidebaritems: SidebarItem[] }>}
 *
 * @note We assume that the parent caller has already locked {@see storageMutex} to avoid a race condition
 */
async function getFromStorage() {
  const storage = await browser.storage.local.get('sidebaritems')
  return storage
}

async function spawnExistingSidebarItems() {
  const { unlock } = await storageMutex.lock()
  let storage = await getFromStorage()
  let { sidebaritems: sidebarItems } = storage

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

/**
 * Creates a sidebar item and registers it, storing it for future browser
 * instances
 *
 * @param {SidebarItemData} itemInfo Information about the sidebar to be created
 */
async function createSidebarItem(itemInfo) {
  const { unlock } = await storageMutex.lock()
  const storage = await getFromStorage()

  const id = await browser.sidebars.add(itemInfo)
  storage.sidebaritems.push({ ...itemInfo, id })

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

spawnExistingSidebarItems()

browser.sidebars.onRemove.addListener((itemId) => removeSidebarItems(itemId))

// =============================================================================
// Messages from UI

browser.runtime.onMessage.addListener(({ type, data }, sender) => {
  switch (type) {
    case MessageTypeValues.CREATE_SIDEBAR_ITEMS:
      createSidebarItem(data)
      break

    default:
      throw new Error(`Unknown message type: ${type}`)
  }

  return null
})
