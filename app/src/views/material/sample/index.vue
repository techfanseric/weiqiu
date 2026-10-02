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

    <!-- 左：粉桶 1×6 | 右：冷藏区 2×2（上）+ 试剂区 4×4（下） -->
    <div class="page-body">
      <!-- 粉桶：上料需填 名称，备注选填 -->
      <section class="lx-panel powder-block">
        <header class="lx-panel-head">
          <span class="lx-panel-title">粉桶</span>
          <span class="lx-count"><b>{{ areaCount('粉桶') }}</b>/{{ areaTotal('粉桶') }}</span>
          <div class="lx-panel-extra">
            <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('粉桶')">
              <template #icon><icon-check /></template>
            </a-button>
            <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('粉桶')">
              <template #icon><icon-close /></template>
            </a-button>
          </div>
        </header>
        <div class="lx-panel-body">
          <div class="slot-fill">
            <slotItems
              :data="varData?.['粉桶']"
              :horizontal="1" :vertical="6"
              :cellWidth="70" :cellHeight="50"
              :start-index="1"
              :maxWidth="125" :maxHeight="537"
              text-field="名称"
              @toggleItemClick="(idx: number) => openCell('粉桶', undefined, idx)"
            />
          </div>
        </div>
      </section>

      <!-- 右侧：冷藏区 + 试剂区 -->
      <div class="body-col">
        <!-- 冷藏区 2 列 × 2 行（共 4 孔） -->
        <section class="lx-panel cold-block">
          <header class="lx-panel-head">
            <span class="lx-panel-title">冷藏区</span>
            <span class="lx-count"><b>{{ areaCount('冷藏区') }}</b>/{{ areaTotal('冷藏区') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('冷藏区')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('冷藏区')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="cold-center">
              <div
                v-for="col in coldColumns"
                :key="col.key"
                class="cold-row"
              >
                <div class="cold-label">
                  {{ col.label }}
                  <span class="lx-count"><b>{{ placedCount('冷藏区', col.key) }}</b>/2</span>
                </div>
                <div class="cold-slot">
                  <slotItems
                    :data="varData?.['冷藏区']?.[col.key]"
                    :horizontal="2" :vertical="1"
                    :cellWidth="60" :cellHeight="50"
                    :start-index="1"
                    :maxWidth="240" :maxHeight="88"
                    text-field="名称"
                    @toggleItemClick="(idx: number) => openCell('冷藏区', col.key, idx)"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 试剂区 4 列 × 4 行 -->
        <section class="lx-panel reagent-block">
          <header class="lx-panel-head">
            <span class="lx-panel-title">试剂区</span>
            <span class="lx-count"><b>{{ areaCount('试剂区') }}</b>/{{ areaTotal('试剂区') }}</span>
            <div class="lx-panel-extra">
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="全部上料" @click="selectAll('试剂区')">
                <template #icon><icon-check /></template>
              </a-button>
              <a-button v-auth="'material.edit'" class="lx-icon-btn" type="text" size="mini" title="清空" @click="clearAll('试剂区')">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </header>
          <div class="lx-panel-body">
            <div class="reagent-cols">
              <div
                v-for="col in reagentColumns"
                :key="col.key"
                class="reagent-col"
              >
                <div class="col-label">
                  {{ col.label }}
                  <span class="lx-count"><b>{{ placedCount('试剂区', col.key) }}</b>/4</span>
                </div>
                <div class="col-slot">
                  <slotItems
                    :data="varData?.['试剂区']?.[col.key]"
                    :horizontal="1" :vertical="4"
                    :cellWidth="60" :cellHeight="55"
                    :start-index="1"
                    :maxWidth="131" :maxHeight="480"
                    text-field="名称"
                    @toggleItemClick="(idx: number) => openCell('试剂区', col.key, idx)"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- 上料弹窗：名称必填 + 备注选填 -->
  <a-modal v-model:visible="dialogVisible" :title="dialogTitle" :footer="false" width="380px">
    <a-form :model="form" layout="vertical" style="padding-top: 4px;">
      <a-form-item label="名称" required>
        <a-input v-model="form.名称" placeholder="请输入上料名称" allow-clear maxlength="30" />
      </a-form-item>
      <a-form-item label="备注">
        <a-input v-model="form.备注" placeholder="请输入备注（选填）" allow-clear maxlength="60" />
      </a-form-item>
    </a-form>
    <a-space style="display: flex; justify-content: flex-end;">
      <a-button v-if="isSingleEdit" size="small" status="danger" @click="removeCell">移除该格</a-button>
      <a-button size="small" @click="dialogVisible = false">取消</a-button>
      <a-button size="small" type="primary" @click="confirmLoad">确定</a-button>
    </a-space>
  </a-modal>

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

// 嵌套区域（列内每格存 有无+名称+备注）
const NESTED_AREAS = ['试剂区', '冷藏区'];

// 试剂区 4 列容器类型配置（每列 4 格，从下到上 1~4）
const reagentColumns = [
  { key: '1', label: '125mlPP瓶' },
  { key: '2', label: '100ml玻璃瓶' },
  { key: '3', label: '500mlPP瓶' },
  { key: '4', label: '500ml玻璃瓶' },
];
// 冷藏区 2 列容器类型配置（每列 2 格，从下到上 1~2）
const coldColumns = [
  { key: '2', label: '125mlPP瓶' },
  { key: '1', label: '100ml玻璃瓶' },
];

type CellValue = { 有无: boolean; 名称: string; 备注: string };
const emptyCell = (): CellValue => ({ 有无: false, 名称: '', 备注: '' });

const defaultData: any = { "粉桶": {}, "试剂区": {}, "冷藏区": {} };
(function initDefaultData() {
  // 粉桶 1×6 = 6（上料需 名称，备注选填）
  let 粉桶: Record<string, CellValue> = {};
  for (let i = 1; i <= 6; i++) {
    粉桶[`${i}`] = emptyCell();
  }
  defaultData['粉桶'] = 粉桶;

  // 试剂区：4 列 × 4 行，每列一个容器类型
  let 试剂区: Record<string, Record<string, CellValue>> = {};
  reagentColumns.forEach((col) => {
    let column: Record<string, CellValue> = {};
    for (let i = 1; i <= 4; i++) {
      column[`${i}`] = emptyCell();
    }
    试剂区[col.key] = column;
  });
  defaultData['试剂区'] = 试剂区;

  // 冷藏区：2 列 × 2 行，每列一个容器类型
  let 冷藏区: Record<string, Record<string, CellValue>> = {};
  coldColumns.forEach((col) => {
    let column: Record<string, CellValue> = {};
    for (let i = 1; i <= 2; i++) {
      column[`${i}`] = emptyCell();
    }
    冷藏区[col.key] = column;
  });
  defaultData['冷藏区'] = 冷藏区;
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

// 上料弹窗状态
const dialogVisible = ref(false);
const form = ref<{ 名称: string; 备注: string }>({ 名称: '', 备注: '' });
// 单格目标 / 整卡填充
const dialogCtx = ref<{ area: string; column?: string; index?: number; fillAll?: boolean; isEdit?: boolean } | null>(null);
const dialogTitle = computed(() => {
  if (!dialogCtx.value) return '上料';
  if (dialogCtx.value.fillAll) return `批量上料（${dialogCtx.value.area}）`;
  if (dialogCtx.value.isEdit) return '编辑上料';
  return '上料';
});
const isSingleEdit = computed(() => !!dialogCtx.value && !dialogCtx.value.fillAll && !!dialogCtx.value.isEdit);

// 取格子对象（嵌套区域 area.column.cell；平铺区域 area.cell）
const getCell = (area: string, column: string | undefined, index: number): any => {
  if (NESTED_AREAS.includes(area)) return varData.value?.[area]?.[column]?.[index];
  return varData.value?.[area]?.[index];
};

// 点空格：新建上料；点已放格：编辑预填
const openCell = (area: string, column: string | undefined, index: number) => {
  const cell = getCell(area, column, index);
  if (!cell) return;
  if (cell['有无']) {
    form.value = { 名称: cell['名称'] || '', 备注: cell['备注'] || '' };
    dialogCtx.value = { area, column, index, isEdit: true };
  } else {
    form.value = { 名称: '', 备注: '' };
    dialogCtx.value = { area, column, index, isEdit: false };
  }
  dialogVisible.value = true;
};

// 整卡全选（同一名称+备注批量填充）
const selectAll = (area: string) => {
  if (!varData.value?.[area]) return;
  form.value = { 名称: '', 备注: '' };
  dialogCtx.value = { area, fillAll: true };
  dialogVisible.value = true;
};

// 清空（整卡）
const clearAll = (area: string) => {
  if (!varData.value?.[area]) return;
  const apply = (cell: any) => {
    cell['有无'] = false;
    cell['名称'] = '';
    cell['备注'] = '';
  };
  if (NESTED_AREAS.includes(area)) {
    const columns = varData.value[area];
    for (const colKey in columns) {
      for (const cellIdx in columns[colKey]) apply(columns[colKey][cellIdx]);
    }
  } else {
    const cells = varData.value[area];
    for (const key in cells) apply(cells[key]);
  }
  editVar(cloneDeep(varData.value));
};

// 确定：名称必填，备注选填
const confirmLoad = () => {
  const ctx = dialogCtx.value;
  if (!ctx) return;
  const name = (form.value['名称'] || '').trim();
  const remark = (form.value['备注'] || '').trim();
  if (!name) {
    Message.warning('请输入名称');
    return;
  }
  const apply = (cell: any) => {
    cell['有无'] = true;
    cell['名称'] = name;
    cell['备注'] = remark;
  };
  if (ctx.fillAll) {
    if (NESTED_AREAS.includes(ctx.area)) {
      const columns = varData.value[ctx.area];
      for (const colKey in columns) {
        for (const cellIdx in columns[colKey]) apply(columns[colKey][cellIdx]);
      }
    } else {
      const cells = varData.value[ctx.area];
      for (const key in cells) apply(cells[key]);
    }
  } else {
    const cell = getCell(ctx.area, ctx.column, ctx.index as number);
    if (!cell) return;
    apply(cell);
  }
  dialogVisible.value = false;
  dialogCtx.value = null;
  editVar(cloneDeep(varData.value));
};

// 移除单个已放格子
const removeCell = () => {
  const ctx = dialogCtx.value;
  if (!ctx || ctx.fillAll) return;
  const cell = getCell(ctx.area, ctx.column, ctx.index as number);
  if (!cell) return;
  cell['有无'] = false;
  cell['名称'] = '';
  cell['备注'] = '';
  dialogVisible.value = false;
  dialogCtx.value = null;
  editVar(cloneDeep(varData.value));
};

// 某列已放置（有无=true）的孔位数，用于列标签后统计
const placedCount = (area: string, colKey: string) => {
  const col = varData.value?.[area]?.[colKey];
  if (!col) return 0;
  return Object.values(col).filter((c: any) => c['有无']).length;
};

// 整卡已放置数 / 总孔位数（面板头的计数）
const areaCount = (area: string) => {
  const v = varData.value?.[area];
  if (!v) return 0;
  if (NESTED_AREAS.includes(area)) {
    let n = 0;
    for (const colKey in v) n += Object.values(v[colKey] || {}).filter((c: any) => c['有无']).length;
    return n;
  }
  return Object.values(v).filter((c: any) => c['有无']).length;
};
const areaTotal = (area: string) => {
  const v = varData.value?.[area];
  if (!v) return 0;
  if (NESTED_AREAS.includes(area)) {
    let n = 0;
    for (const colKey in v) n += Object.keys(v[colKey] || {}).length;
    return n;
  }
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

// 旧数据兼容：老字段「类型」(存的试剂名) 迁移为「名称」
const migrateLegacy = () => {
  NESTED_AREAS.forEach((area) => {
    const columns = varData.value?.[area];
    if (!columns) return;
    for (const colKey in columns) {
      const col = columns[colKey];
      if (!col) continue;
      for (const cellIdx in col) {
        const cell = col[cellIdx];
        if (cell && cell['有无'] && !cell['名称'] && cell['类型']) {
          cell['名称'] = cell['类型'];
        }
      }
    }
  });
};

onMounted(async () => {
  varData.value = { ...varData.value, ...cloneDeep(defaultData) };
  await handleGetVarData();
  migrateLegacy();
});
</script>

<style lang="less" scoped>
/* 全出血：抵消 .layout-content 的 1rem 内边距 + 去掉全局 .layout-table 的面板外观，
   与首页控制台保持同一套骨架（ground 底 + 自绘面板） */
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
.page-body{
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
}
.body-col{
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
.powder-block{
  flex: 0 0 168px;
  min-height: 0;
}
.cold-block{
  flex: 0 0 auto;
}
.reagent-block{
  flex: 1;
  min-height: 0;
}

/* 面板体：给格子一层内边距，格子本身没有外边距；格子按上限缩放后居中 */
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

/* 试剂区：4 列，列内 label + 4 格。
   height:100% 而不是 min-height —— 让高度链确定，格子才能被 maxHeight 正确夹住（不会撑高容器） */
.reagent-cols{
  display: flex;
  gap: 10px;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
  .reagent-col{
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
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

/* 冷藏区：每行 = 容器类型 + 2 格 */
.cold-center{
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  box-sizing: border-box;
  .cold-row{
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cold-label{
    flex: 0 0 108px;
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 6px;
    font-size: 0.6rem;
    color: var(--lx-text-2, var(--color-text-2));
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cold-slot{
    flex: 1;
    min-width: 0;
    /* 高度要放得下被 maxHeight 限制后的两格（约 84px 高），否则格子会被压扁 */
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
}
</style>
