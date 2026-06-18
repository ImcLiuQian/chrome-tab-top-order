async function firstNormalTabIndex(windowId) {
  const tabs = await chrome.tabs.query({ windowId });
  return tabs.filter((tab) => tab.pinned).length;
}

async function moveNewTabToTop(tab) {
  if (!tab.id || tab.pinned) {
    return;
  }

  const index = await firstNormalTabIndex(tab.windowId);
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
  moveNewTabToTop(tab).catch((error) => {
    console.warn("Failed to move new tab to top:", error);
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
