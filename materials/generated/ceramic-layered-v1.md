# 白瓷伙伴分层动画 v1

日期：2026-10-23。还原基线提交：`17e3637`（四款整体动效版）。

## 素材与实现

使用内置 imagegen，以 `app/src/assets/generated/lab-assistant-v2.png` 为参考，分别生成三张透明图：

- `app/src/assets/generated/ceramic-head.png`：无眼睛、眉毛与嘴巴的分子头。
- `app/src/assets/generated/ceramic-body.png`：带颈部和胸灯的白瓷身体，不含头和手臂。
- `app/src/assets/generated/ceramic-arm.png`：单侧独立手臂，另一侧通过页面镜像使用。

原白瓷整图保留。`CeramicAssistant.vue` 将三张图组装，并以独立 SVG 眼睛、眉毛、三种嘴型与 CSS 关节动画实现表情。每个实例的眼睛渐变使用唯一 ID。欢迎头像、语音入口与字幕头像共用状态。

| 状态 | 表情与动作 |
| --- | --- |
| 待机 | 呼吸、偶尔眨眼、双臂轻摆 |
| 聆听 | 侧头、抬左臂、眉毛稍抬 |
| 思考 | 视线上移、偏头、右臂移近下巴 |
| 说话 | 微笑/小开口/圆口循环替换、点头、双臂交替讲解 |

手臂基础姿势用 550ms 插值过渡，叠加小幅关节摆动。眨眼在约 5.6 秒循环中出现两次短闭合。三种嘴型以 1.1 秒节奏替换，当前为说话状态循环，不做发音口型同步。

## 页面使用

选择白瓷伙伴后，默认“分层表情”，可切回“整体轻动”比较。`ceramicMotion=whole` 将原模式保存在链接中；省略该参数使用新分层版。四状态手动预览、循环演示、自动跟随问答继续可用。

## 生成提示词

### head

Precise-object-edit for an animation rig. Reference image 1 is the existing white porcelain molecular robot; preserve its exact soft ceramic 3D style, white and aqua palette, front orthographic view and upper-left studio lighting. Output a single isolated transparent PNG part, not a complete robot, no text, labels, floor or background, no extra parts or views. Create ONLY the HEAD: the six-sided white porcelain face plate with its aqua molecular hexagon frame, six round white-and-aqua corner nodes and two upper short antenna stalks. REMOVE BOTH EYES, BOTH EYEBROWS AND MOUTH ENTIRELY: the face must be a pristine blank smooth white surface, no holes, no expression marks, no ghost outlines or sockets. No neck, torso, arms or body. Keep the original hexagonal proportions and the six circle nodes. Center the entire head and antennae in a square canvas with roughly 8% transparent margin on every side, front view with the head absolutely symmetrical. This blank head receives eyes and mouth in software.

### body

Precise-object-edit for an animation rig. Reference image 1 is the existing white porcelain molecular robot; preserve its exact soft ceramic 3D style, white and aqua palette, front orthographic view and upper-left studio lighting. Output a single isolated transparent PNG part, not a complete robot, no text, labels, floor or background, no extra parts or views. Create ONLY the armless TORSO: white smooth egg-shaped robot torso with deep blue narrow side panels, its small circular navy chest panel with cyan center light, and short white neck with aqua collar. REMOVE HEAD and BOTH ARMS entirely, no arm stubs, no feet. Smooth silhouette at the sides where removable arms will attach. The white egg torso is taller than wide, like reference, not a spherical ball. Center the body in a square canvas, entire neck and body visible, about 8% vertical transparent margin, symmetrical front view.

### arm

Precise-object-edit for an animation rig. Reference image 1 is the existing white porcelain molecular robot; preserve its exact soft ceramic 3D style, white and aqua palette, front orthographic view and upper-left studio lighting. Output a single isolated transparent PNG part, not a complete robot, no text, labels, floor or background, no extra parts or views. Create ONLY ONE DETACHED ARM, matching the robot arm on the viewer's LEFT side: simple elongated softly rounded teardrop/flipper shape, porcelain white outer shell with a smooth navy blue inset face, thin soft aqua seam. Top narrow rounded shoulder attachment at upper RIGHT; broad smooth rounded tip lower LEFT. It is a single short appendage angled down-left around 25 degrees from vertical, smooth one-piece flipper, no fingers, no joints, no shoulder ball, no torso, no head, no other objects. Keep clean silhouette and ceramic volume. Center this one isolated arm with 12% clear transparent margin. Will be mirrored in software for the other arm.


## 验证记录

- `git diff --check`、类型检查、演示构建通过。
- 浏览器检查头、身体、双臂在四状态下的定位，并调整手臂姿势插值。
- 眼睛在 0 / 2184 / 2500ms 的纵向缩放分别为 1 / 0.06 / 1，验证睁闭眼。
- 在说话周期的七个采样点，三种嘴型始终只显示一个。
- 验证分层/整体模式切换及其他三款形象保留原效果；减少动态效果时无活动动画。
- 从预览进入实验问题查询，语音入口与字幕两个实例均进入说话状态，预览标记清除。
- `docs/screenshots/ceramic-layered-preview.gif` 为四状态组件近景，`ceramic-layered-speaking.png` 为页面效果。
- 真实麦克风、识别服务与发音口型同步不属于本轮验证内容。
