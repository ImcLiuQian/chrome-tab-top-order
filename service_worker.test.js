const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadWorker(chrome) {
  const code = fs.readFileSync(path.join(__dirname, "service_worker.js"), "utf8");
  const context = {
    chrome,
    console: { warn() {} },
    setTimeout,
  };

  vm.runInNewContext(code, context, { filename: "service_worker.js" });
  return context;
}

function createChromeMock(tabs) {
  const tabById = new Map(tabs.map((tab) => [tab.id, { ...tab }]));
  const calls = [];

  return {
    calls,
    tabById,
    tabs: {
      async query({ windowId }) {
        return [...tabById.values()]
          .filter((tab) => tab.windowId === windowId)
          .sort((a, b) => a.index - b.index);
      },
      async get(id) {
        return tabById.get(id);
      },
      async move(id, moveProperties) {
        calls.push({ method: "move", id, moveProperties });
        tabById.get(id).index = moveProperties.index;
      },
      async highlight(highlightInfo) {
        calls.push({ method: "highlight", highlightInfo });
      },
      onCreated: { addListener() {} },
    },
    action: {
      onClicked: { addListener() {} },
    },
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("refocuses an active created tab after moving it to the first normal index", async () => {
  const chrome = createChromeMock([
    { id: 1, windowId: 7, index: 0, pinned: true, url: "https://pinned.example", active: false },
    { id: 2, windowId: 7, index: 1, pinned: false, url: "https://old.example/a", active: false },
    { id: 3, windowId: 7, index: 2, pinned: false, url: "https://old.example/b", active: false },
    { id: 4, windowId: 7, index: 3, pinned: false, pendingUrl: "chrome://newtab/", active: true },
  ]);
  const worker = loadWorker(chrome);

  await worker.moveCreatedTab(chrome.tabById.get(4));

  assert.deepEqual(plain(chrome.calls), [
    { method: "move", id: 4, moveProperties: { index: 1 } },
    { method: "highlight", highlightInfo: { windowId: 7, tabs: 1 } },
  ]);
});

test("does not refocus a background created tab after moving it", async () => {
  const chrome = createChromeMock([
    { id: 1, windowId: 7, index: 0, pinned: false, url: "https://old.example/a", active: true },
    { id: 2, windowId: 7, index: 1, pinned: false, pendingUrl: "https://new.example/", active: false },
  ]);
  const worker = loadWorker(chrome);

  await worker.moveCreatedTab(chrome.tabById.get(2));

  assert.deepEqual(plain(chrome.calls), [
    { method: "move", id: 2, moveProperties: { index: 0 } },
  ]);
});
