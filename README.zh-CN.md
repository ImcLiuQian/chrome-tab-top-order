# Chrome Tab Top Order

[English](README.md) | 简体中文

![Chrome Tab Top Order 预览图](assets/tab-order-preview.svg)

Chrome Tab Top Order 是一个很小的 Chrome MV3 扩展，用来解决 Chrome 标签页越开越乱的问题：**新打开的标签页会自动移动到当前窗口普通标签页的最上面，之前的标签页自然往下排。**

它适合使用垂直标签栏、侧边栏标签列表，或者习惯把最新上下文放在最前面的工作流。

## 解决了什么问题

- 新开标签默认插入在当前位置或末尾时，最新上下文不够醒目。
- 标签页很多时，刚打开的页面容易被旧页面夹住。
- 手动拖动标签排序很烦，而且容易打断当前工作流。

## 功能

- 新打开的普通标签页自动移动到当前窗口顶部。
- 复制出来的标签页会插到原标签页的正上方，不会直接跑到最上面。
- 已固定的标签页保持在最前面，不参与重排。
- 点击扩展图标，可以把当前窗口已有普通标签页顺序反转一次。
- 无构建步骤，无依赖，加载目录即可使用。

## 使用方法

1. 打开 Chrome，访问 `chrome://extensions/`。
2. 打开右上角的 `Developer mode`。
3. 点击 `Load unpacked`。
4. 选择本项目目录：

```text
/Users/bytedance/my_project/chrome_tab_top_order
```

加载完成后，新开的普通标签页会自动排到最上面。

如果你想把当前窗口里已经存在的普通标签页也翻过来，点击一次工具栏里的 `Chrome Tab Top Order` 扩展图标即可。

## 文件说明

- `manifest.json`: Chrome MV3 扩展声明。
- `service_worker.js`: 监听新标签页创建事件，并把新标签移动到顶部。
- `assets/tab-order-preview.svg`: README 预览图。
- `LICENSE`: MIT License。

## License

MIT
