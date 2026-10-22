# 实验助手形象 v1

日期：2026-10-22。用途：大屏语音入口、问答卡片与回答字幕。基于用户提供的分子机器人形象重新制作，使用内置 imagegen，透明背景，非官方机构吉祥物。

资产：`app/src/assets/generated/lab-assistant-v1.png`。

保留六边形分子头、六节点、青色触角和蓝色身体；简化身体电路线条，使用柔和立体材质。现有 UI 中提供待机、聆听与回答入口状态，问答卡片按需展开，回答仍用短暂单行字幕。

呈现参考：WorkBuddy 官方任务对话说明 https://www.workbuddy.ai/docs/zh/workbuddy/Conversation 。本项目保留五类实验查询，不增加历史聊天。

## 生成提示词

Use case: stylized-concept. Create a newly designed polished UI assistant mascot based on reference Image 1 (character identity reference only). Transparent background. One single centered friendly small laboratory robot, front view with slight three dimensional depth, full body, generous transparent margin. Keep the unmistakable hexagonal molecular head with six round nodes at its corners, two tiny short antenna stalks above, a pale icy-blue face, dark navy expressive oval eyes and a small gentle smile. Compact rounded deep blue floating torso and small rounded arms, with only one simple cyan chest indicator; simplify circuit traces, eliminate clutter and floating exterior rays. Proportions: large readable head, compact body. Sophisticated soft matte 3D product illustration, ceramic and satin polymer, soft studio lighting upper left, subtle cyan rim, crisp silhouette, restrained professional scientific UI character, approachable not childish. Palette navy #014099, medium blue #3578bd, pale blue white, soft cyan #52ccd8 (avoid neon). No logos, no text, no floor, no props, no background, no frame, no multiple views. Must remain legible at 64px and 120px in a white and pale blue research dashboard.

## 检查

类型检查与演示构建通过。浏览器查看了待机入口、展开卡片、点击问题后的字幕，以及关闭入口位置。真实麦克风链路未在本次改动中验收。
