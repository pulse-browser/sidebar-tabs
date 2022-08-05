browser.sidebars.add({
    title: "Add Button",
    iconUrl: "chrome://global/skin/icons/plus.svg",
    webviewUrl: "index.html",
    isBottom: true,
});

getFromStorage();

async function getFromStorage() {
    //get from storage
    let sidebaritems = await browser.storage.local.get("sidebaritems");
    if (sidebaritems.sidebaritems == undefined) {
    sidebaritems.sidebaritems = [];
    }
    //create sidebar items
    for (let i = 0; i < sidebaritems.sidebaritems.length; i++) {
    browser.sidebars.add({
        title: sidebaritems.sidebaritems[i].title,
        iconUrl: sidebaritems.sidebaritems[i].iconUrl,
        webviewUrl: sidebaritems.sidebaritems[i].webviewUrl,
    });
    }
}

async function removeFromStorage(index) {
    //get from storage
    let sidebaritems = await browser.storage.local.get("sidebaritems");
    for (let i = 0; i < sidebaritems.sidebaritems.length; i++) {
    if (sidebaritems.sidebaritems[i].iconindex == index) {
        //remove the item
        sidebaritems.sidebaritems.splice(i, 1);
        //save to storage
        browser.storage.local.set({
            sidebaritems: sidebaritems.sidebaritems
        });
        break;
    }
    }
}

async function saveToStorage({title: title, iconUrl: iconUrl, webviewUrl: webviewUrl, iconindex: iconindex}) {
    console.log("saveToStorage");
    //save to sidebaritems
    let sidebaritems = await browser.storage.local.get("sidebaritems");
    if (sidebaritems.sidebaritems == undefined) {
      sidebaritems.sidebaritems = [];
    }
    sidebaritems.sidebaritems.push({
      title: title,
      iconUrl: iconUrl,
      webviewUrl: webviewUrl,
      iconindex: iconindex
    });
    browser.storage.local.set(sidebaritems);
}

browser.sidebars.onRemove.addListener((itemId) => {
    removeFromStorage(itemId);
})

function connectionManager(port) {
    port.onMessage.addListener(async (message) => {
        if (message.type == "saveToStorage") {
            saveToStorage({
                title: message.title,
                iconUrl: message.pageIcon,
                webviewUrl: message.webviewUrl,
                iconindex: message.iconindex
            });
        }
    }
    
)};

browser.runtime.onConnect.addListener(connectionManager);