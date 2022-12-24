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

/**
 * @returns {Promise<{ sidebaritems: SidebarItem[] }>}
 */
async function getFromStorage() {
  return await browser.storage.local.get('sidebaritems')
}

/**
 * @param {{sidebaritems: SidebarItem[]}} storage
 */
async function spawnExistingSidebarItems(storage) {
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
}

/**
 * @param {number} idToRemove The id of the sidebar item you wish to remove
 */
async function removeSidebarItems(idToRemove) {
  let storage = await getFromStorage()

  storage.sidebaritems = storage.sidebaritems.filter(
    (item) => item.id !== idToRemove
  )

  await browser.storage.local.set(storage)
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
