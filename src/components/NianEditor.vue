<template>
  <div class="nian-editor">
    <div
      v-if="showToolbar"
      class="flex items-center gap-1 p-2 border-b border-calm-200 bg-white rounded-t-xl flex-wrap"
    >
      <button
        @click="toggleBold"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 font-bold text-sm"
        :class="{ 'bg-calm-200': editor?.isActive('bold') }"
      >
        B
      </button>
      <button
        @click="toggleItalic"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 italic text-sm"
        :class="{ 'bg-calm-200': editor?.isActive('italic') }"
      >
        I
      </button>
      <div class="w-px h-6 bg-calm-200 mx-1"></div>
      <button
        @click="toggleBulletList"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 text-sm"
        :class="{ 'bg-calm-200': editor?.isActive('bulletList') }"
      >
        •
      </button>
      <button
        @click="toggleOrderedList"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 text-sm"
        :class="{ 'bg-calm-200': editor?.isActive('orderedList') }"
      >
        1.
      </button>
      <button
        @click="toggleBlockquote"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 text-sm"
        :class="{ 'bg-calm-200': editor?.isActive('blockquote') }"
      >
        ❝
      </button>
      <div class="w-px h-6 bg-calm-200 mx-1"></div>
      <button
        @click="toggleHeading(1)"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 text-xs font-bold"
        :class="{ 'bg-calm-200': editor?.isActive('heading', { level: 1 }) }"
      >
        H1
      </button>
      <button
        @click="toggleHeading(2)"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 text-xs font-bold"
        :class="{ 'bg-calm-200': editor?.isActive('heading', { level: 2 }) }"
      >
        H2
      </button>
      <button
        @click="toggleHeading(3)"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-calm-100 text-calm-700 text-xs font-bold"
        :class="{ 'bg-calm-200': editor?.isActive('heading', { level: 3 }) }"
      >
        H3
      </button>
      <div class="flex-1"></div>
      <span class="text-xs text-calm-400">{{ wordCount }} 字</span>
    </div>
    <editor-content
      :editor="editor"
      class="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      :class="{ 'rounded-xl border border-calm-200': !showToolbar }"
    />
    <div
      v-if="showFooter"
      class="flex items-center gap-2 p-3 border-t border-calm-200 bg-calm-50 rounded-b-xl"
    >
      <div class="flex items-center gap-1 flex-1">
        <input
          v-model="tagInput"
          @keydown.enter.prevent="addTag"
          placeholder="添加标签..."
          class="px-3 py-1.5 rounded-lg border border-calm-200 text-sm w-32 focus:outline-none focus:border-primary-400"
        />
        <button
          v-if="tagInput"
          @click="addTag"
          class="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded"
        >
          添加
        </button>
      </div>
      <div v-for="tag in tags" :key="tag"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-calm-200 text-calm-700 rounded-full text-xs">
        #{{ tag }}
        <button @click="removeTag(tag)" class="text-calm-400 hover:text-calm-600 ml-0.5">&times;</button>
      </div>
      <div class="w-px h-6 bg-calm-200 mx-1"></div>
      <div class="flex items-center gap-1">
        <button
          v-for="m in moodOptions"
          :key="m.value"
          @click="selectedMood = m.value"
          class="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all"
          :class="selectedMood === m.value ? 'bg-calm-200 ring-2 ring-calm-400 scale-110' : 'hover:bg-calm-100'"
          :title="m.label"
        >
          {{ m.icon }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import type { NianMood } from '@/types'

const props = defineProps<{
  modelValue: string
  mood?: NianMood
  tags?: string[]
  showToolbar?: boolean
  showFooter?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:mood': [value: NianMood]
  'update:tags': [value: string[]]
}>()

const selectedMood = ref<NianMood>(props.mood || 'neutral')
const localTags = ref<string[]>(props.tags || [])
const tagInput = ref('')

const moodOptions = [
  { value: 'calm' as NianMood, label: '平静', icon: '😌' },
  { value: 'happy' as NianMood, label: '开心', icon: '😊' },
  { value: 'neutral' as NianMood, label: '一般', icon: '😐' },
  { value: 'anxious' as NianMood, label: '焦虑', icon: '😰' },
  { value: 'sad' as NianMood, label: '难过', icon: '😢' },
  { value: 'angry' as NianMood, label: '生气', icon: '😤' }
]

watch(selectedMood, (v) => emit('update:mood', v))
watch(localTags, (v) => emit('update:tags', v), { deep: true })

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || '记录下此刻的感悟……'
    }),
    CharacterCount.configure({
      limit: 5000
    })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && val !== editor.value.getHTML()) {
      editor.value.commands.setContent(val || '')
    }
  }
)

watch(
  () => props.tags,
  (val) => {
    if (val) localTags.value = [...val]
  },
  { deep: true }
)

watch(
  () => props.mood,
  (val) => {
    if (val) selectedMood.value = val
  }
)

const wordCount = computed(() => {
  if (!editor.value) return 0
  const text = editor.value.getText()
  return text.replace(/\s/g, '').length
})

const addTag = () => {
  const t = tagInput.value.trim()
  if (t && !localTags.value.includes(t)) {
    localTags.value.push(t)
  }
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  localTags.value = localTags.value.filter((t) => t !== tag)
}

const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()
const toggleBlockquote = () => editor.value?.chain().focus().toggleBlockquote().run()
const toggleHeading = (level: 1 | 2 | 3) =>
  editor.value?.chain().focus().toggleHeading({ level }).run()

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.nian-editor :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
  line-height: 1.8;
  font-size: 0.95rem;
  color: #334155;
}

.nian-editor :deep(.ProseMirror p) {
  margin: 0.5em 0;
}

.nian-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
}

.nian-editor :deep(.ProseMirror h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.8em 0 0.4em;
  color: #1e293b;
}

.nian-editor :deep(.ProseMirror h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
  color: #1e293b;
}

.nian-editor :deep(.ProseMirror h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.5em 0 0.3em;
  color: #1e293b;
}

.nian-editor :deep(.ProseMirror ul),
.nian-editor :deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.nian-editor :deep(.ProseMirror li) {
  margin: 0.2em 0;
}

.nian-editor :deep(.ProseMirror blockquote) {
  border-left: 3px solid #cbd5e1;
  padding-left: 1em;
  margin: 0.8em 0;
  color: #64748b;
  font-style: italic;
}

.nian-editor :deep(.ProseMirror strong) {
  font-weight: 600;
}

.nian-editor :deep(.ProseMirror em) {
  font-style: italic;
}
</style>