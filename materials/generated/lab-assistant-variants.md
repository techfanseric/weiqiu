# 实验助手形象多版本

制作日期：2026-10-23。在 v1 基础上增加三个使用内置 imagegen 独立生成的透明底形象，统一以用户提供的分子机器人原图作为身份参考。本项目助手设计候选，非官方机构吉祥物。

| 版本 | 页面名称 | 资产 | 设计方向 |
| --- | --- | --- | --- |
| v1 | 蓝晶伙伴 | `app/src/assets/generated/lab-assistant-v1.png` | 原首版蓝色立体 |
| v2 | 白瓷伙伴 | `app/src/assets/generated/lab-assistant-v2.png` | 白色陶瓷身体、青色分子头 |
| v3 | 轻绘精灵 | `app/src/assets/generated/lab-assistant-v3.png` | 简洁平面插画 |
| v4 | 晶透助手 | `app/src/assets/generated/lab-assistant-v4.png` | 玻璃与蓝色胶囊身体 |

点击“问问助手”，在卡片底部切换形象。欢迎头像、语音入口、回答字幕同步更新。选择写入 URL 的 `assistant` 参数（classic / ceramic / illustrated / glass），刷新可恢复，无效值使用首版。切换保留其他 URL 参数与当前实验状态。

## 生成提示词

### v2 · 白瓷伙伴

Use case: stylized-concept. Generate ONE newly designed scientific laboratory UI assistant mascot on a genuinely transparent background, based on reference 1 for identity only. Full body centered front view, identical roughly 80% canvas height, large hexagonal molecular head (six round corner nodes, two short upper antennae), navy oval eyes and gentle smile, short rounded floating torso and two little arms. Readable at 64 pixels. Blue #014099, white and soft cyan #52ccd8. Professional welcoming scientific companion. Preserve recognizable molecular robot identity but redesign rendering. No text, logos, background, floor, shadows outside silhouette, props, frames, multiple characters or multiple views. STYLE: Premium soft matte ceramic 3D, warm white porcelain face and WHITE compact egg-shaped torso, deep-blue side panels and small cyan seams, pastel pale aqua molecular head rim and small nodes, subtle restrained cyan antennae. Clean Apple-like product lighting, smooth simple forms, soft shading, calm inviting face. White body with a single navy circular chest status light. Avoid glossy chrome, neon and intricate circuits.

### v3 · 轻绘精灵

Use case: stylized-concept. Generate ONE newly designed scientific laboratory UI assistant mascot on a genuinely transparent background, based on reference 1 for identity only. Full body centered front view, identical roughly 80% canvas height, large hexagonal molecular head (six round corner nodes, two short upper antennae), navy oval eyes and gentle smile, short rounded floating torso and two little arms. Readable at 64 pixels. Blue #014099, white and soft cyan #52ccd8. Professional welcoming scientific companion. Preserve recognizable molecular robot identity but redesign rendering. No text, logos, background, floor, shadows outside silhouette, props, frames, multiple characters or multiple views. STYLE: Sophisticated flat 2D editorial vector-like illustration (raster PNG output), precise bold rounded contours, gentle two-tone fills, no 3D rendering or photographic shading. Pale blue hexagonal face, navy blue rounded body and arms, cyan molecular corner rings, navy oval eyes and minimal smiling mouth. Balanced disciplined geometry, a few tasteful flat cyan highlights. Small friendly compact silhouette. Professional modern SaaS mascot aesthetic. No fine circuit lines, no gradients, no floating particles.

### v4 · 晶透助手

Use case: stylized-concept. Generate ONE newly designed scientific laboratory UI assistant mascot on a genuinely transparent background, based on reference 1 for identity only. Full body centered front view, identical roughly 80% canvas height, large hexagonal molecular head (six round corner nodes, two short upper antennae), navy oval eyes and gentle smile, short rounded floating torso and two little arms. Readable at 64 pixels. Blue #014099, white and soft cyan #52ccd8. Professional welcoming scientific companion. Preserve recognizable molecular robot identity but redesign rendering. No text, logos, background, floor, shadows outside silhouette, props, frames, multiple characters or multiple views. STYLE: Elegant translucent frosted glass and satin resin 3D character. Soft frosted ice-blue molecular head frame with six translucent rounded nodes, opaque pale white face for excellent readability, deep sapphire-blue translucent capsule torso containing one softly lit aqua status dot, short little satin navy arms. Gentle studio illumination with controlled soft edges, high quality restrained glass reflections. More compact proportions, calm smile. Avoid rainbow iridescence, neon glow, harsh chrome, excessive details or external decorative particles.


## 验证结果

- `npm run typecheck`、`npm run build:demo` 通过。
- ego 浏览器逐一切换四版，欢迎头像和语音入口均同步，选中状态与 URL 一致；刷新恢复晶透助手选择。
- 十样本与机台在右布局参数保留；白瓷版提问后字幕头像正确。
- 并排对比图：`docs/screenshots/assistant-variants-comparison.png`；白瓷版页面效果：`docs/screenshots/assistant-variants-v2.png`。
