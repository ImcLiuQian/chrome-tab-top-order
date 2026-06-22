async function firstNormalTabIndex(windowId) {
  const tabs = await chrome.tabs.query({ windowId });
  return tabs.filter((tab) => tab.pinned).length;
}

function visibleTabUrl(tab) {
  return tab.pendingUrl || tab.url || "";
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function tabWithUrl(tab) {
  if (visibleTabUrl(tab)) {
    return tab;
  }

  for (let i = 0; i < 5; i += 1) {
    await wait(80);
    const latest = await chrome.tabs.get(tab.id);

    if (visibleTabUrl(latest)) {
      return latest;
    }
  }

  return tab;
}

async function duplicatedTabIndex(tab) {
  if (!tab.openerTabId) {
    return null;
  }

  let opener;

  try {
    opener = await chrome.tabs.get(tab.openerTabId);
  } catch {
    return null;
  }

  if (opener.windowId !== tab.windowId || opener.pinned) {
    return null;
  }

  const openerUrl = visibleTabUrl(opener);
  const tabUrl = visibleTabUrl(tab);

  return openerUrl && tabUrl && openerUrl === tabUrl ? opener.index : null;
}

async function moveCreatedTab(tab) {
  if (!tab.id || tab.pinned) {
    return;
  }

  const latest = await tabWithUrl(tab);
  const duplicateIndex = await duplicatedTabIndex(latest);
  const index = duplicateIndex ?? (await firstNormalTabIndex(latest.windowId));

  await chrome.tabs.move(tab.id, { index });
}

async function reverseCurrentWindow(windowId) {
  const tabs = await chrome.tabs.query({ windowId });
  const pinnedCount = tabs.filter((tab) => tab.pinned).length;
  const normalTabs = tabs.filter((tab) => !tab.pinned).reverse();

  for (let i = 0; i < normalTabs.length; i += 1) {
    await chrome.tabs.move(normalTabs[i].id, { index: pinnedCount + i });
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  moveCreatedTab(tab).catch((error) => {
    console.warn("Failed to move created tab:", error);
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab.windowId) {
    return;
  }

  reverseCurrentWindow(tab.windowId).catch((error) => {
    console.warn("Failed to reverse current window tabs:", error);
  });
});
