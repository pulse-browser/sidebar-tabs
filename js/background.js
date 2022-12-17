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
    return sidebaritems;
}

async function createSidebarItems(sidebaritems) {
    if (sidebaritems.sidebaritems == undefined) {
        sidebaritems.sidebaritems = [];
    }
    
    for (let i = 0; i < sidebaritems.sidebaritems.length; i++) {
        var item = await browser.sidebars.add({
            title: sidebaritems.sidebaritems[i].title,
            iconUrl: sidebaritems.sidebaritems[i].iconUrl,
            webviewUrl: sidebaritems.sidebaritems[i].webviewUrl,
        });
        sidebaritems.sidebaritems[i].id = item;
    }

    await browser.storage.local.set(sidebaritems);
}

async function removeSidebarItems(itemId)
{
    let storagearray = await getFromStorage();
    for (let i = 0; i < storagearray.sidebaritems.length; i++) {
        if (storagearray.sidebaritems[i].id == itemId) {
            storagearray.sidebaritems.splice(i, 1);
        }
    }

    await browser.storage.local.set(storagearray);
}

browser.sidebars.onRemove.addListener((itemId) => {
    removeSidebarItems(itemId);
})
