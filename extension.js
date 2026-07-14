function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

const ROOT_MENU_ID = "vgde-root";
browser.menus.create(
  {
    id: ROOT_MENU_ID,
    title: "VGTunes Dashboard Extension",
    contexts: ["tools_menu"],
  },
  onCreated,
);

const BANDCAMP_ROOT_MENUID = "vgde-bandcamp-root";
browser.menus.create(
  {
    id: BANDCAMP_ROOT_MENUID,
    title: "Bandcamp",
    parentId: ROOT_MENU_ID,
  },
  onCreated,
);

const COPY_PLATOFMR_ID_MENUID = "vgde-bandcamp-copyPlatformId";
browser.menus.create(
  {
    id: COPY_PLATOFMR_ID_MENUID,
    title: "Copy Platform ID",
    parentId: BANDCAMP_ROOT_MENUID,
  },
  onCreated,
);

let bandcampURLRegex = /bandcamp\.com\//;
browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == COPY_PLATOFMR_ID_MENUID) {
    tryGenerateBandcampPlatformId(tab);
  }
});

browser.commands.onCommand.addListener((command) => {
  if (command == "copy-bandcamp-platform-id") {
    browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
      if (tabs.length > 0) {
        tryGenerateBandcampPlatformId(tabs[0]);
      }
    }, null);
  }
});

function tryGenerateBandcampPlatformId(tab) {
  if (bandcampURLRegex.test(tab.url)) {
    browser.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      func: () => {
        const metaElements = document.getElementsByTagName("meta");
        for (const element of metaElements) {
          if (element.name == "bc-page-properties") {
            json_content = JSON.parse(element.content);

            output = `${json_content.item_id}|${window.location.href}`;

            navigator.clipboard.writeText(output);

            alert(
              `Generated platform Id:\n\n${output}\n\n(Copied to clipboard)`,
            );
            return;
          }
        }

        alert("Unable to generate platform Id for this page.");
      },
    });
  }
}
