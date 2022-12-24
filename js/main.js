import { MessageTypeValues } from './message.js'

/**
 * Send a message to the background page to be processed
 * @param {import("./message").MessageType} type
 * @param {*} data
 */
async function sendMessageToBackgroundScript(type, data) {
  return await browser.runtime.sendMessage({ type, data })
}

async function createSidebarItem(title, iconUrl, webviewUrl) {
  await sendMessageToBackgroundScript(MessageTypeValues.CREATE_SIDEBAR_ITEMS, {
    title,
    iconUrl,
    webviewUrl,
  })
}

async function addPage() {
  var pageURL = document.getElementById('url').value
  if (!pageURL) {
    return
  }
  pageURL = pageURL.replace(/^https?:\/\//, '')
  let pageIcon = 'chrome://global/skin/icons/link.svg'
  if (navigator.onLine) {
    var response = await fetch(
      `https://icons.duckduckgo.com/ip3/${pageURL}.ico`
    )
    if (response.ok) {
      pageIcon = 'https://icons.duckduckgo.com/ip3/' + pageURL + '.ico'
    }
  }

  if (navigator.onLine) {
    let newtab = browser.tabs.create({
      url: 'https://' + pageURL,
      active: true,
    })
    newtab.then(function (tab) {
      browser.tabs.onUpdated.addListener(function listener(
        tabId,
        changeInfo,
        tab
      ) {
        if (tabId == tab.id && changeInfo.status == 'complete') {
          browser.tabs.onUpdated.removeListener(listener)
          browser.tabs.get(tab.id).then(function (tab) {
            createSidebarItem(tab.title, pageIcon, tab.url)
          })
        }
      })
    })
  } else {
    createSidebarItem(pageURL, pageIcon, 'https://' + page)
  }
}

document.getElementById('addPageButton').addEventListener('click', addPage)

//Stolen from https://github.com/mdn/webextensions-examples
function setSidebarStyle(theme) {
  const body = document.body

  if (theme.colors && theme.colors.frame) {
    body.style.backgroundColor = theme.colors.frame
  } else {
    body.style.backgroundColor = 'white'
  }

  if (theme.colors && theme.colors.toolbar) {
    body.style.backgroundColor = theme.colors.toolbar
  } else {
    body.style.backgroundColor = '#ebebeb'
  }

  if (theme.colors && theme.colors.toolbar_text) {
    body.style.color = theme.colors.toolbar_text
  } else {
    body.style.color = 'black'
  }
}

// Set the element style when the extension page loads
async function setInitialStyle() {
  const theme = await browser.theme.getCurrent()
  setSidebarStyle(theme)
}
setInitialStyle()

// Watch for theme updates
browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
  const sidebarWindow = await browser.windows.getCurrent()
  /*
    Only update theme if it applies to the window the sidebar is in.
    If a windowId is passed during an update, it means that the theme is applied to that specific window.
    Otherwise, the theme is applied globally to all windows.
  */
  if (!windowId || windowId == sidebarWindow.id) {
    setSidebarStyle(theme)
  }
})
