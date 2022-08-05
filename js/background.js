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

browser.sidebars.onRemove.addListener((itemId) => {
    removeFromStorage(itemId);
})