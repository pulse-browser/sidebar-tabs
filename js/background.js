browser.sidebars.add({
    title: "Add Button",
    iconUrl: "icons/plus.svg",
    webviewUrl: "index.html",
    isBottom: true,
})

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