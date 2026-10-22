# 四款助手分层动画

日期：2026-10-23。在白瓷伙伴已确认的方案上，为蓝晶伙伴、轻绘精灵与晶透助手分别补齐头部、身体、单侧手臂共九张透明 PNG，使用内置 imagegen 独立制作，参考各款原首版形象。

## 素材

三款新增资产位于 `app/src/assets/generated/`，文件名前缀分别为 `classic-`、`illustrated-`、`glass-`，每款包含 `head.png`、`body.png`、`arm.png`。白瓷伙伴继续使用 `ceramic-*`。

四款均保留分子六边形头部、六节点与两根短触角。蓝晶保留柔和立体蓝色材质；轻绘使用插画轮廓、平面深蓝眼睛；晶透保留玻璃质感和电路细节。

## 实现与页面

- `LayeredAssistant.vue`：共用眨眼、三种嘴型替换、头部与双臂动画。`CeramicAssistant.vue` 保留为白瓷兼容入口。
- `AssistantLayer.vue` 与 `assistantLayers.ts`：以 SVG 画布摆放原始 PNG。按 alpha 轮廓范围统一各部件的留白与大小，使用等比缩放和位移，原 PNG 像素不变。眼口位置可按款式校准。
- 四状态：待机呼吸眨眼；聆听侧头抬手；思考视线上移、手臂靠近下巴；说话嘴型开合并交替摆臂。手臂姿势用 550ms 过渡。
- 页面所有款式均支持“分层表情 / 整体轻动”、四状态单独预览、循环演示与自动问答联动。欢迎头像、语音按钮与字幕同步。
- 模式参数统一为 `assistantMotion=whole`，省略使用分层版；兼容旧白瓷链接 `ceramicMotion=whole`。切换模式时清理旧参数。
- 嘴型是状态循环，不是发音口型同步；预览不启用麦克风或播报。减少动态效果时保留静态姿势和状态文字。

## 生成提示词

### classic · head

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original soft matte 3D blue scientific robot: icy white face, satin aqua molecular frame with six white center nodes, navy blue torso and arms, one cyan chest indicator and short line. Soft upper-left studio lighting, rounded ceramic/polymer surfaces. ONLY the isolated HEAD, absolutely front facing and symmetrical. Include the complete hexagonal molecular head with six corner nodes and two short antennae. REMOVE ALL eyes, eyebrows, mouth and face marks COMPLETELY: pristine smooth blank face plate, no sockets or ghost marks. No neck, torso, arms or other objects. Center in square canvas, 8% transparent margin. Preserve reference head silhouette. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### classic · body

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original soft matte 3D blue scientific robot: icy white face, satin aqua molecular frame with six white center nodes, navy blue torso and arms, one cyan chest indicator and short line. Soft upper-left studio lighting, rounded ceramic/polymer surfaces. ONLY the armless TORSO with short neck/collar and original chest indicator. REMOVE head and BOTH arms completely, no arm stubs, hands or feet. Compact smooth egg/capsule body as in reference, symmetrical front view, side edges ready for separate arm attachment. Center in square canvas, 10% vertical margin. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### classic · arm

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original soft matte 3D blue scientific robot: icy white face, satin aqua molecular frame with six white center nodes, navy blue torso and arms, one cyan chest indicator and short line. Soft upper-left studio lighting, rounded ceramic/polymer surfaces. ONLY ONE DETACHED ARM matching the reference's viewer LEFT arm. Single elongated rounded flipper, narrow shoulder upper RIGHT and rounded tip lower LEFT, angled down-left about 25 degrees from vertical. Preserve reference arm color and rendering. No fingers, shoulder ball, torso, other parts or objects. Center isolated arm in square canvas with generous transparent margin. Will be mirrored for opposite arm. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### illustrated · head

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original clean flat vector-like 2D illustrated robot: pale ice blue face, bold solid cyan molecular hexagon outline and round nodes, navy body with simple cyan accent lines and flat chest indicator. No realistic materials, no 3D shading, no shadows; precise flat fills, clean rounded contours. ONLY the isolated HEAD, absolutely front facing and symmetrical. Include the complete hexagonal molecular head with six corner nodes and two short antennae. REMOVE ALL eyes, eyebrows, mouth and face marks COMPLETELY: pristine smooth blank face plate, no sockets or ghost marks. No neck, torso, arms or other objects. Center in square canvas, 8% transparent margin. Preserve reference head silhouette. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### illustrated · body

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original clean flat vector-like 2D illustrated robot: pale ice blue face, bold solid cyan molecular hexagon outline and round nodes, navy body with simple cyan accent lines and flat chest indicator. No realistic materials, no 3D shading, no shadows; precise flat fills, clean rounded contours. ONLY the armless TORSO with short neck/collar and original chest indicator. REMOVE head and BOTH arms completely, no arm stubs, hands or feet. Compact smooth egg/capsule body as in reference, symmetrical front view, side edges ready for separate arm attachment. Center in square canvas, 10% vertical margin. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### illustrated · arm

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original clean flat vector-like 2D illustrated robot: pale ice blue face, bold solid cyan molecular hexagon outline and round nodes, navy body with simple cyan accent lines and flat chest indicator. No realistic materials, no 3D shading, no shadows; precise flat fills, clean rounded contours. ONLY ONE DETACHED ARM matching the reference's viewer LEFT arm. Single elongated rounded flipper, narrow shoulder upper RIGHT and rounded tip lower LEFT, angled down-left about 25 degrees from vertical. Preserve reference arm color and rendering. No fingers, shoulder ball, torso, other parts or objects. Center isolated arm in square canvas with generous transparent margin. Will be mirrored for opposite arm. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### glass · head

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original frosted glass 3D robot: icy white opaque face, translucent aqua molecular frame with glossy six round nodes, shiny deep sapphire blue translucent capsule torso and arms, cyan circular chest light and a few simple circuit accents. Restrained glass reflections and studio lighting. ONLY the isolated HEAD, absolutely front facing and symmetrical. Include the complete hexagonal molecular head with six corner nodes and two short antennae. REMOVE ALL eyes, eyebrows, mouth and face marks COMPLETELY: pristine smooth blank face plate, no sockets or ghost marks. No neck, torso, arms or other objects. Center in square canvas, 8% transparent margin. Preserve reference head silhouette. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### glass · body

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original frosted glass 3D robot: icy white opaque face, translucent aqua molecular frame with glossy six round nodes, shiny deep sapphire blue translucent capsule torso and arms, cyan circular chest light and a few simple circuit accents. Restrained glass reflections and studio lighting. ONLY the armless TORSO with short neck/collar and original chest indicator. REMOVE head and BOTH arms completely, no arm stubs, hands or feet. Compact smooth egg/capsule body as in reference, symmetrical front view, side edges ready for separate arm attachment. Center in square canvas, 10% vertical margin. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.

### glass · arm

Precise-object-edit: create a transparent PNG part for a layered UI character animation rig from reference image 1. Preserve the original mascot's visual identity, colors and rendering style. Original frosted glass 3D robot: icy white opaque face, translucent aqua molecular frame with glossy six round nodes, shiny deep sapphire blue translucent capsule torso and arms, cyan circular chest light and a few simple circuit accents. Restrained glass reflections and studio lighting. ONLY ONE DETACHED ARM matching the reference's viewer LEFT arm. Single elongated rounded flipper, narrow shoulder upper RIGHT and rounded tip lower LEFT, angled down-left about 25 degrees from vertical. Preserve reference arm color and rendering. No fingers, shoulder ball, torso, other parts or objects. Center isolated arm in square canvas with generous transparent margin. Will be mirrored for opposite arm. Single part only; no text, logos, labels, floor, backdrop, border or extra views. Genuine transparent background.


## 验证结果

- 类型检查与演示构建通过，`git diff --check` 通过。
- 四款 × 四状态共 16 种组合，欢迎头像与语音入口使用正确款式和状态；四款均可切回整体轻动再切回分层表情。
- 每款眼睛在 0 / 2184 / 2500ms 分别为睁开 / 闭合 / 睁开；每款说话周期七个采样点始终只有一种嘴型可见。
- 减少动态效果设置下活动动画数为零。
- 查询实验后，语音入口与字幕两个实例均使用选中款式并进入说话状态，预览标记清除。
- 并排动效预览：`docs/screenshots/assistant-layered-all-preview.gif`（页面组件复制到并排展示画布，保留实际材质、部件和动画）；页面截图：`assistant-layered-all-page.png`。
- 实际麦克风与识别服务链路本轮未操作。
- 旧白瓷链接正确恢复整体模式；统一模式参数在刷新、切换款式后保留。已恢复蓝晶分层版循环演示供查看。
