# 新制作的界面视觉

## 2026-10-23：助手形象与分层资产

四款助手均为本项目创作方案，不代表 SIAT 官方吉祥物。原参考形象用于创作参考，正式资产重新生成；官方 Logo 仍使用官网原件。

- [四款形象创作记录](lab-assistant-variants.md)：蓝晶伙伴、白瓷伙伴、轻绘精灵与晶透助手。
- [白瓷伙伴分层记录](ceramic-layered-v1.md)与[其余三款分层记录](assistant-layered-all.md)：每款头部、身体、单侧手臂，共 12 张透明 PNG；页面镜像手臂、叠加五官与动作。
- [v2.1.0 图文说明](../../docs/版本升级说明-20261023.md)与[动效实现说明](../../docs/助手动效说明-20261023.md)。

## 2026-10-02：机台视觉（原记录保留）

制作于 2026-10-02，使用内置 imagegen 工具，非 CLI/API 回退。

- 应用资产：`app/src/assets/generated/microsphere-workcell.png`，1536 × 1024 透明 PNG，约 2 MB。
- 原图角色：`materials/originals/c3c86c1d590cde01d960676cd20aa0be.png` 只作结构与相对布局参考；工具重新生成设备图，没有把原图裁切、去底、调色后直接用进页面。
- 页面模块层：`app/src/display/index.vue` 中的 `zones` 是独立 SVG 多边形，`regionData` 是标签锚点。坐标对应新生成图的 1536 × 1024 画布；不沿用旧机械图像素。
- 已视觉核对：两台中央机械臂、平行轨道、后部反应容器、左侧配液与右侧检测/后处理区域。生成图内部结构有简化，准确站号和最终热区尚需现场确认。首版展示中标明“设备示意 · 区域待现场校准”。
- Logo：直接复制 `materials/brand/siat/szxjy-logo.png` 至 `app/src/assets/brand/siat-logo.png`，保持官方双徽标组合及原始比例；未使用生成工具重画。

## 最终生成提示词

Use case: product-mockup. Create a completely newly authored polished 3D equipment illustration for a Chinese scientific laboratory dashboard. The attached machine image is STRUCTURAL REFERENCE ONLY; do not simply retouch, recolor or reuse it. Rebuild in a clean art-directed product visualization style. Show ONE entire automated PS-DVB microsphere laboratory workbench from a high three-quarter isometric viewpoint, wide landscape 3:2 composition, centered, generous transparent margin. Preserve the main spatial organization visible in reference: rectangular aluminum table frame, TWO white articulated collaborative robotic arms on TWO parallel long linear tracks in the center; reagent vial racks at front-left; powder dispensing and mixing stations at rear-left; four-neck reaction vessel assemblies with gantries and oil baths at back-center; sampling microscope at rear-right; rows of vial racks beside centrifuge/ultrasonic/oven rectangular modules at right and front-right. Simplify mechanical screws and cables for legibility but maintain distinct recognizable lab modules, do not add enclosing walls. Materials pearl white powdercoated enclosures, brushed silver rails, carefully restrained deep SIAT-blue (#014099) on robot joints and module trims, transparent glass reaction flasks, subtle amber liquid in a few reagent vials. Soft neutral studio illumination from upper left, crisp beautifully crafted product edges, gentle contact shadows, strong physical depth, no overexposure, no bright cyan, no black backdrop. Short visible table legs. This is an exhibition-quality conceptual equipment overview, not a blueprint. No text, no numbers, no logo, no arrows, no hotspots, no labels, no UI, no inset images, no duplicated panel views. Fully transparent background.

## 字体

从 [Google Fonts Manrope](https://fonts.google.com/specimen/Manrope) 和 [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) 选型；本地托管，运行时不向 Google 取字体。

- Manrope：Google Fonts 官方仓库 `ofl/manrope/Manrope[wght].ttf`，用 FontTools 子集化为 WOFF2，保留 UI 数字、西文与常见符号。
- Noto Sans SC：Google Fonts CSS2 服务按源代码中 765 个汉字生成 400/500/600/700 字重的子集，再转换 WOFF2；按 unicode-range 加载。新增业务文本超出子集时浏览器使用中文后备字体，扩充界面时可重新生成子集。
- 字体许可证：`app/public/fonts/Manrope-OFL.txt`、`NotoSansSC-OFL.txt`。字体文件共约 480 KB。

蓝色来源仍以 `materials/brand/siat/` 为准，不把网页采样色描述为正式 VI 手册。
