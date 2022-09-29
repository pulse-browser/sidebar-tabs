browser.sidebars.add({
    title: "Add Shortcut to Sidebar",
    iconUrl: "plus.svg",
    webviewUrl: "index.html",
    isBottom: true,
})

getFromStorage().then(createSidebarItems);

async function getFromStorage() {
    //get from storage
    let sidebaritems = await browser.storage.local.get("sidebaritems");
    console.log(sidebaritems);
    return sidebaritems;
}

async function createSidebarItems(sidebaritems) {
    //create sidebar items
    for (let i = 0; i < sidebaritems.sidebaritems.length; i++) {
        browser.sidebars.add({
            title: sidebaritems.sidebaritems[i].title,
            iconUrl: sidebaritems.sidebaritems[i].iconUrl,
            webviewUrl: sidebaritems.sidebaritems[i].webviewUrl,
        });
    }
}

async function removeSidebarItems(itemId)
{
    const item = await browser.sidebars.get(itemId);

    //remove from storage
    let storagearray = await getFromStorage();
    let storageitems = storagearray.sidebaritems;

    for (let i = 0; i < storageitems.length; i++) {
        if (storageitems[i].webviewUrl == item.webviewUrl) {
            storageitems.splice(i, 1);
        }
    }

    browser.storage.local.set(storagearray);
}

browser.sidebars.onRemove.addListener((itemId) => {
    removeSidebarItems(itemId);
})
