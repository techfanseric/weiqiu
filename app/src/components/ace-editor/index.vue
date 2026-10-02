<template>
  <div class="editor-wrapper" 
    :style="{ 
      height: editorHeight,
      width: width
    }" 
  >
    <div ref="editorContainer" class="editor-container" ></div>
    <div 
      class="resize-handle" 
      @mousedown="startResize"
      v-if="showResizeHandle"
    ></div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
// 定义组件 props
const props = defineProps({
  // 编辑器初始值
  modelValue: {
    type: String,
    default: ''
  },
  showResizeHandle: {
    type: Boolean,
    default: true
  },
  // 编辑器语言
  language: {
    type: String,
    default: "json"
  },
  // 编辑器主题
  theme: {
    type: String,
    default: "tomorrow_night"
  },
  // 编辑器高度
  height: {
    type: String,
    default: '300px'
  },
  // 编辑器宽度
  width: {
    type: String,
    default: '100%'
  },
  // 是否只读
  readOnly: {
    type: Boolean,
    default: false
  },
  // 折叠代码
  folding: {
    type: Boolean,
    default: true
  },
  // 自动关闭括号
  autoClosingBrackets: {
    type: Boolean,
    default: true
  },
  // 自动关闭引号
  autoClosingQuotes: {
    type: Boolean,
    default: true
  }
});

// 定义组件事件
const emit = defineEmits(['update:modelValue', 'change']);

// 编辑器容器引用
const editorContainer = ref<HTMLDivElement | null>(null);
// 编辑器实例
let editor: ace.Ace.Editor | null = null;

// 编辑器高度
const editorHeight = ref(props.height);
// 鼠标按下状态
let isResizing = false;

// 开始调整大小
const startResize = (e: MouseEvent) => {
  isResizing = true;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  e.preventDefault();
};

// 鼠标移动时调整大小
const onMouseMove = (e: MouseEvent) => {
  if (!isResizing || !editorContainer.value) return;
  
  const containerRect = editorContainer.value.getBoundingClientRect();
  const newHeight = e.clientY - containerRect.top;
  
  // 设置最小高度为 200px
  if (newHeight > 200) {
    editorHeight.value = `${newHeight}px`;
    // 编辑器自动布局
    editor?.resize();
  }
};

// 结束调整大小
const onMouseUp = () => {
  isResizing = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
};

// 初始化编辑器
const initEditor = () => {
  if (!editorContainer.value) return;  
  // 创建编辑器实例
  editor = ace.edit(editorContainer.value);
  ace.config.set('basePath', 'ace-builds');
  editor.setOptions({
    value: typeof props.modelValue=='object'?JSON.stringify(props.modelValue, null, 2):props.modelValue,
    fontSize: 14,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    printMargin: false,
    readOnly: props.readOnly,
    foldStyle: props.folding ? 'markbegin' : 'manual',
    useWorker: true,
    mode: `ace/mode/${props.language}`,
    theme: `ace/theme/${props.theme}`
  });
  // 监听编辑器内容变化
  editor.on('change', handleEditorChange);
};

// Handle editor content change
const handleEditorChange = () => {
  if (editor) {
    const value = editor.getValue();
    emit('update:modelValue', value);
    emit('change', value); 
  }
};

// 组件挂载时初始化编辑器
onMounted(() => {
  initEditor();
});

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
});

// 监听 props 变化，更新编辑器配置
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue);
  }
});

watch(() => props.language, (newLanguage) => {
  if (editor) {
    editor.session.setMode(`ace/mode/${newLanguage}`);
  }
});

watch(() => props.theme, (newTheme) => {
  if (editor) {
    editor.setTheme(`ace/theme/${newTheme}`);
  }
});

watch(() => props.readOnly, (newReadOnly) => {
  if (editor) {
    editor.setReadOnly(newReadOnly);
  }
});



// 暴露方法给父组件
defineExpose({
  // 获取编辑器实例
  getEditor: () => editor,
  // 聚焦编辑器
  focus: () => editor?.focus(),
  // 获取编辑器内容
  getValue: () => editor?.getValue(),
  // 设置编辑器内容
  setValue: (value: string) => editor?.setValue(value),
  // 撤销
  undo: () => editor?.undo(),
  // 重做
  redo: () => editor?.redo()
});
</script>

<style scoped>

.editor-wrapper {
  position: relative;
}

.editor-container {
  overflow: hidden;
  border-radius: 4px;
  min-height: 200px;
  width: 100%;
  height: 100%;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
  background-color: transparent;
  z-index: 10;
}

.resize-handle:hover {
  background-color: var(--color-fill-2);
}

.resize-handle::before {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background-color: var(--color-text-4);
  border-radius: 1px;
}
</style>