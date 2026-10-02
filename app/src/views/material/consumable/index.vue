<template>
  <div class="layout-table page-flex">
    <!-- 工具栏：查看数据 | 重置 · 保存 -->
    <div class="lx-toolbar">
      <a-button size="small" type="outline" @click="showDataModal = true">
        <template #icon><icon-eye /></template>查看数据
      </a-button>
      <div class="toolbar-spacer"></div>
      <a-space v-auth="'material.edit'" :size="8">
        <a-button size="small" @click="handleReset">重置数据</a-button>
        <a-button size="small" type="primary" @click="handleSave">保存</a-button>
      </a-space>
    </div>

    <!-- 四栏布局：磁子/Tip头 | 烧杯区 | 玻片/Tip头2 | 试管架 -->
    <div class="areas">
      <!-- 第一栏：磁子 + Tip头 -->
      <div class="area-col col-main">
        <section class="lx-panel area-block block-major">
          <header class="lx-panel-head">
            <span class="lx-panel-title">磁子</span>
            <span class="lx-count"><b>{{ areaCount('磁子') }}</b>/{{ areaTotal('磁子') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('磁子')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('磁子')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="slot-fill">
              <slotItems
                :data="varData?.['磁子']"
                :horizontal="2" :vertical="2"
                :cellWidth="60" :cellHeight="55"
                :start-index="1"
                :maxWidth="250" :maxHeight="229"
                @toggleItemClick="(idx: number) => handleToggle('磁子', idx)"
              />
            </div>
          </div>
        </section>

        <section class="lx-panel area-block block-minor">
          <header class="lx-panel-head">
            <span class="lx-panel-title">Tip头</span>
            <span class="lx-count"><b>{{ areaCount('Tip头') }}</b>/{{ areaTotal('Tip头') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('Tip头')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('Tip头')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="slot-fill">
              <slotItems
                :data="varData?.['Tip头']"
                :horizontal="3" :vertical="6"
                :cellWidth="55" :cellHeight="40"
                :start-index="1"
                @toggleItemClick="(idx: number) => handleToggle('Tip头', idx)"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- 第二栏：烧杯区（玻片/Tip头2 左侧）500ml烧杯 1×4 -->
      <div class="area-col col-narrow">
        <section class="lx-panel area-block">
          <header class="lx-panel-head">
            <span class="lx-panel-title">烧杯区</span>
            <span class="lx-count"><b>{{ areaCount('烧杯区') }}</b>/{{ areaTotal('烧杯区') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('烧杯区')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('烧杯区')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="beaker-cols">
              <div class="col-label">500ml烧杯</div>
              <div class="col-slot">
                <slotItems
                  :data="varData?.['烧杯区']"
                  :horizontal="1" :vertical="4"
                  :cellWidth="60" :cellHeight="55"
                  :start-index="1"
                  :maxWidth="131" :maxHeight="480"
                  @toggleItemClick="(idx: number) => handleToggle('烧杯区', idx)"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 第三栏：玻片 + Tip头2 -->
      <div class="area-col col-main">
        <section class="lx-panel area-block block-major">
          <header class="lx-panel-head">
            <span class="lx-panel-title">玻片</span>
            <span class="lx-count"><b>{{ areaCount('玻片') }}</b>/{{ areaTotal('玻片') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('玻片')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('玻片')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="slot-fill">
              <slotItems
                :data="varData?.['玻片']"
                :horizontal="10" :vertical="1"
                :cellWidth="55" :cellHeight="50"
                :start-index="1"
                @toggleItemClick="(idx: number) => handleToggle('玻片', idx)"
              />
            </div>
          </div>
        </section>

        <section class="lx-panel area-block block-minor">
          <header class="lx-panel-head">
            <span class="lx-panel-title">Tip头2</span>
            <span class="lx-count"><b>{{ areaCount('Tip头2') }}</b>/{{ areaTotal('Tip头2') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('Tip头2')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('Tip头2')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="slot-fill">
              <slotItems
                :data="varData?.['Tip头2']"
                :horizontal="6" :vertical="3"
                :cellWidth="60" :cellHeight="60"
                :start-index="1"
                @toggleItemClick="(idx: number) => handleToggle('Tip头2', idx)"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- 第四栏：试管架 1×3 -->
      <div class="area-col col-narrow">
        <section class="lx-panel area-block">
          <header class="lx-panel-head">
            <span class="lx-panel-title">试管架</span>
            <span class="lx-count"><b>{{ areaCount('试管架') }}</b>/{{ areaTotal('试管架') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('试管架')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('试管架')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="slot-fill">
              <slotItems
                :data="varData?.['试管架']"
                :horizontal="1" :vertical="3"
                :cellWidth="70" :cellHeight="50"
                :start-index="1"
                :maxWidth="125" :maxHeight="179"
                @toggleItemClick="(idx: number) => handleToggle('试管架', idx)"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- 数据查看弹窗 -->
  <a-modal v-model:visible="showDataModal" title="数据查看" width="750px" :footer="false">
    <AceEditor
      :modelValue="jsonData"
      :readOnly="true"
      language="json"
      height="500px"
      :showResizeHandle="false"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import api from '@/api';
import { Message } from '@arco-design/web-vue';
import { IconCheck, IconClose, IconEye } from '@arco-design/web-vue/es/icon';
import { handleGetVarData, varData } from '@/hooks/main';
import { MATERIAL_AREA_KEYS } from '../areas';
import slotItems from '@/components/slot-items/index.vue';
import AceEditor from '@/components/ace-editor/index.vue';
import { cloneDeep } from 'lodash';

// 全区域：点空格直接切换「有无」（烧杯区同其它区，无弹窗）
const defaultData: any = {
  "磁子": {},
  "Tip头": {},
  "烧杯区": {},
  "玻片": {},
  "Tip头2": {},
  "试管架": {},
};
(function initDefaultData() {
  // 磁子 2×2 = 4
  let 磁子: Record<string, { 有无: boolean }> = {};
  for (let i = 1; i <= 4; i++) {
    磁子[`${i}`] = { 有无: false };
  }
  defaultData['磁子'] = 磁子;

  // Tip头 3×6 = 18（竖排）
  let Tip头: Record<string, { 有无: boolean }> = {};
  for (let i = 1; i <= 18; i++) {
    Tip头[`${i}`] = { 有无: false };
  }
  defaultData['Tip头'] = Tip头;

  // 烧杯区 1 列 × 4 行，仅切有无
  let 烧杯区: Record<string, { 有无: boolean }> = {};
  for (let i = 1; i <= 4; i++) {
    烧杯区[`${i}`] = { 有无: false };
  }
  defaultData['烧杯区'] = 烧杯区;

  // 玻片 10×1 = 10
  let 玻片: Record<string, { 有无: boolean }> = {};
  for (let i = 1; i <= 10; i++) {
    玻片[`${i}`] = { 有无: false };
  }
  defaultData['玻片'] = 玻片;

  // Tip头2 6×3 = 18
  let Tip头2: Record<string, { 有无: boolean }> = {};
  for (let i = 1; i <= 18; i++) {
    Tip头2[`${i}`] = { 有无: false };
  }
  defaultData['Tip头2'] = Tip头2;

  // 试管架 1×3 = 3
  let 试管架: Record<string, { 有无: boolean }> = {};
  for (let i = 1; i <= 3; i++) {
    试管架[`${i}`] = { 有无: false };
  }
  defaultData['试管架'] = 试管架;
})()

// 重置：只保留已定义区域，移除历史残留，本页区域恢复默认
const handleReset = () => {
  const next: any = {};
  for (const key of Object.keys(varData.value)) {
    if (MATERIAL_AREA_KEYS.includes(key)) next[key] = varData.value[key];
  }
  varData.value = { ...next, ...cloneDeep(defaultData) };
};

// 保存：手动触发持久化
const handleSave = () => {
  editVar(cloneDeep(varData.value));
};

// 数据查看弹窗
const showDataModal = ref(false);
const jsonData = computed(() => JSON.stringify(varData.value, null, 2));

// 全选
const selectAll = (area: string) => {
  if (!varData.value?.[area]) return;
  const cells = varData.value[area];
  for (const key in cells) {
    cells[key]['有无'] = true;
  }
  editVar(cloneDeep(varData.value));
};

// 清空
const clearAll = (area: string) => {
  if (!varData.value?.[area]) return;
  const cells = varData.value[area];
  for (const key in cells) {
    cells[key]['有无'] = false;
  }
  editVar(cloneDeep(varData.value));
};

// 点击格子切换「有无」
const handleToggle = (area: string, index: number) => {
  if (!varData.value?.[area]?.[index]) return;
  varData.value[area][index]['有无'] = !varData.value[area][index]['有无'];
  editVar(cloneDeep(varData.value));
};

// 已放置数 / 总孔位数（面板头计数）
const areaCount = (area: string) => {
  const v = varData.value?.[area];
  if (!v) return 0;
  return Object.values(v).filter((c: any) => c['有无']).length;
};
const areaTotal = (area: string) => {
  const v = varData.value?.[area];
  if (!v) return 0;
  return Object.keys(v).length;
};

const editVar = async (data: any) => {
  try {
    varData.value = { ...data };
    await api.paramsConfig.editVar(data);
    Message.success('保存成功');
  } catch (error) {
    console.log(error);
    Message.error('保存失败');
  }
};

onMounted(async () => {
  varData.value = { ...varData.value, ...cloneDeep(defaultData) };
  await handleGetVarData();
  normalizeAreas();
});

// 兼容旧烧杯区嵌套结构 {'1': {1:{有无},..}} → 扁平 {1:{有无},..}
const normalizeAreas = () => {
  const bk: any = varData.value?.['烧杯区'];
  if (!bk || bk['1'] && typeof bk['1'] === 'object' && bk['1']['1'] && typeof bk['1']['1'] === 'object' && bk['1']['1']['有无'] !== undefined) {
    const flat: Record<string, { 有无: boolean }> = {};
    for (const k in bk?.['1']) {
      flat[k] = { 有无: !!bk['1'][k]?.['有无'] };
    }
    varData.value['烧杯区'] = flat;
  }
};
</script>

<style lang="less" scoped>
/* 全出血：与首页控制台 / 试剂管理同一套骨架 */
.layout-table.page-flex{
  width: calc(100% + 2rem);
  height: calc(100% + 2rem);
  margin: -1rem;
  padding: 14px;
  background: var(--lx-ground, var(--color-bg-1));
  border: none;
  border-radius: 0;
  box-shadow: none;
  box-sizing: border-box;
}
.page-flex{
  display: flex;
  flex-direction: column;
}
.toolbar-spacer{
  flex: 1;
}
.areas{
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
}
.area-col{
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
/* 栏宽：主栏（双面板）宽一些，窄栏（单列竖排）窄一些。
   窄栏只有一个面板，让它撑满列高，四栏底部才对得齐（格子居中，尺寸由 maxWidth/maxHeight 夹住） */
.col-main{
  flex: 1.1;
}
.col-narrow{
  flex: 0.45;
  .area-block{
    flex: 1;
  }
}
.area-block{
  min-height: 0;
}
/* 上排矮、下排高（磁子 vs Tip头 / 玻片 vs Tip头2） */
.block-major{
  flex: 0.62;
}
.block-minor{
  flex: 1;
}

/* 面板体：给格子一层内边距；格子按上限缩放后在面板里居中 */
.slot-fill{
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
  line-height: 0;
}

/* 烧杯区：单个竖排列（height:100% 让高度链确定，格子才受 maxHeight 约束） */
.beaker-cols{
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
.col-label{
  flex-shrink: 0;
  padding-bottom: 7px;
  font-size: 0.6rem;
  letter-spacing: 0.02em;
  color: var(--lx-text-2, var(--color-text-2));
  text-align: center;
  line-height: 1.25;
  word-break: break-all;
}
.col-slot{
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
</style>
