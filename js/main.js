async function addPage() {
  var pageURL = (document.getElementById("url").value);
  if (!pageURL) {
    return;
  }

  // remove https:// or http:// from the url
  pageURL = pageURL.replace(/^https?:\/\//, '');

  let pageIcon = "chrome://global/skin/icons/link.svg";

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

            //save to storage
            saveToStorage({
              title: tab.title,
              iconUrl: pageIcon,
              webviewUrl: tab.url,
            });
          });
        }
      });
    });
 
  }
  else
  {
    //If the user is offline, create a sidebar item with the title as the url 
    //and the icon as the default icon so the browser sidebar is functional offline
    browser.sidebars.add({
      title: pageURL,
      iconUrl: pageIcon,
      webviewUrl: pageURL,
    });
  }

}

async function saveToStorage({title: title, iconUrl: iconUrl, webviewUrl: webviewUrl}) {
  //save to sidebaritems
  let sidebaritems = await browser.storage.local.get("sidebaritems");
  if (sidebaritems.sidebaritems == undefined) {
    sidebaritems.sidebaritems = [];
  }
  sidebaritems.sidebaritems.push({
    title: title,
    iconUrl: iconUrl,
    webviewUrl: webviewUrl,
  });
  browser.storage.local.set(sidebaritems);
}

document.getElementById("addPageButton").addEventListener("click", addPage);