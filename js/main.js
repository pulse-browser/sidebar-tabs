async function addPage() {
  var pageURL = (document.getElementById("url").value);
  // remove https:// or http:// from the url
  pageURL = pageURL.replace(/^https?:\/\//, '');

  let pageIcon = "icons/link.svg";

  if (navigator.onLine) {
    //fetch https://icons.duckduckgo.com/ip3 image for icon
    var response = await fetch(`https://icons.duckduckgo.com/ip3/${pageURL}.ico`);
    if (response.ok) {
      //create sidebar item
      pageIcon = ('https://icons.duckduckgo.com/ip3/'+pageURL+'.ico')
    }
  }

  if (navigator.onLine) {
    //create new tab
    let newtab = browser.tabs.create({ url: "https://"+pageURL, active: true});
    //newtab await complete load
    newtab.then(function(tab) {
      //wait for complete load
      browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
        if (tabId == tab.id && changeInfo.status == "complete") {
          //remove listener
          browser.tabs.onUpdated.removeListener(listener);
          //get tab title
          browser.tabs.get(tab.id).then(function(tab) {
            //create new sidebar
            browser.sidebars.add({
              title: tab.title,
              iconUrl: pageIcon,
              webviewUrl: tab.url,
            });
          });
        }
      });
    });
 
  }

}

async function saveToStorage(sidebaricon){
  var sidebaricons = await browser.storage.local.get("sidebaricons");
  if (!sidebaricons.sidebaricons) {
    sidebaricons = {sidebaricons: []};
  }
  sidebaricons.sidebaricons.push(sidebaricon);
  browser.storage.local.set(sidebaricons);
}

async function recall() {
  //get pages from storage and add them to sidebar
  browser.storage.local.get("pages").then(function(pages) {
    if (pages.pages) {
        pages.pages.forEach(function(page) {
            browser.sidebars.add({
                title: page.url,
                iconUrl: "icons/link.svg",
                webviewUrl: page.url,
            });
        });
    }
  });
}

document.getElementById("addPageButton").addEventListener("click", addPage);
document.getElementById("recall").addEventListener("click", recall);