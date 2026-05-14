<template>
  <div class="flex flex-col items-center min-h-[calc(100vh-160px)]">
    <!-- 页面标题 -->
    <div class="mb-3 text-center w-full max-w-md">
      <h2 class="text-xl font-medium text-calm-800">这一刻，你感受到什么？</h2>
      <p class="text-sm text-calm-600">识别并标记此刻的负面情绪（可多选）</p>
    </div>

    <!-- 分类 Tab -->
    <div class="w-full max-w-md mb-3 overflow-x-auto">
      <div class="flex space-x-2 pb-1">
        <button
          v-for="cat in emotionCategories"
          :key="cat.name"
          @click="currentCategory = cat.name"
          class="px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-all duration-200 font-medium"
          :class="{
            'bg-primary-500 text-white border-primary-500': currentCategory === cat.name,
            'bg-white text-calm-600 border-calm-200 hover:border-calm-300': currentCategory !== cat.name
          }"
        >
          {{ cat.emoji }} {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- 当前分类的情绪卡片列表 -->
    <div class="w-full max-w-md flex-1 mb-3 overflow-y-auto">
      <div class="space-y-2">
        <div
          v-for="emotion in currentCategoryEmotions"
          :key="emotion.id"
          @click="toggleEmotion(emotion.id)"
          class="flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
          :class="{
            'border-primary-500 bg-primary-50': selectedEmotions.includes(emotion.id),
            'border-calm-200 bg-white hover:border-calm-300': !selectedEmotions.includes(emotion.id)
          }"
        >
          <div class="flex-1 min-w-0">
            <div class="font-medium text-calm-800">{{ emotion.text }}</div>
            <div class="text-xs text-calm-500 mt-0.5 leading-relaxed">{{ emotion.desc }}</div>
          </div>
          <div
            class="ml-3 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
            :class="{
              'bg-primary-500 text-white': selectedEmotions.includes(emotion.id),
              'border-2 border-calm-200': !selectedEmotions.includes(emotion.id)
            }"
          >
            <span v-if="selectedEmotions.includes(emotion.id)">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 已选汇总 -->
    <div v-if="selectedEmotions.length > 0" class="w-full max-w-md mb-3">
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="item in selectedEmotionItems"
          :key="item.id"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs"
        >
          {{ item.text }}
          <button @click="toggleEmotion(item.id)" class="text-primary-400 hover:text-primary-600 leading-none">✕</button>
        </span>
      </div>
    </div>

    <!-- 完成按钮 -->
    <button
      @click="completeAndGo"
      :disabled="selectedEmotions.length === 0"
      class="btn-primary w-full max-w-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      完成
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = useRouter()
const store = useUrgeStore()

const getRouteParams = inject<() => any>('getRouteParams')

const emotionCategories = [
  {
    name: '愤怒类',
    emoji: '😠',
    items: [
      { id: 'anger_annoyance', text: '烦扰', desc: '小事引起的短暂不悦，接近但未到敌意' },
      { id: 'anger_anger', text: '生气', desc: '对阻碍或不公产生的对抗性情绪反应' },
      { id: 'anger_rage', text: '暴怒', desc: '失控的极端愤怒，伴有攻击冲动' },
      { id: 'anger_resentment', text: '怨恨', desc: '对长期不公的持续不满和敌意（愤怒+厌恶）' },
      { id: 'anger_contempt', text: '轻蔑', desc: '带有优越感的愤怒，藐视他人（愤怒+厌恶）' },
      { id: 'anger_envy', text: '嫉妒', desc: '对他人优势的不甘与痛苦（愤怒+悲伤）' },
    ]
  },
  {
    name: '恐惧/焦虑类',
    emoji: '😨',
    items: [
      { id: 'fear_apprehension', text: '担忧', desc: '对未来具体事件的轻微不安' },
      { id: 'fear_fear', text: '害怕', desc: '面对可识别威胁时的防御性恐惧' },
      { id: 'fear_terror', text: '惊恐', desc: '极度的、压倒性的恐惧感' },
      { id: 'fear_anxiety', text: '焦虑', desc: '对未来或未知的持续过度担忧（恐惧+期待）' },
      { id: 'fear_helpless', text: '无助', desc: '感觉自己无法控制或应对情境' },
    ]
  },
  {
    name: '悲伤类',
    emoji: '😢',
    items: [
      { id: 'sad_pensiveness', text: '低落', desc: '轻微的情绪下降或沉思' },
      { id: 'sad_sadness', text: '悲伤', desc: '对损失、挫折的自然情绪反应' },
      { id: 'sad_grief', text: '悲痛', desc: '深刻持久的悲伤，常伴随生理反应' },
      { id: 'sad_frustration', text: '沮丧', desc: '期望落空后的灰心与无力感（悲伤+惊讶）' },
      { id: 'sad_disappointment', text: '失望', desc: '期待与现实不符产生的挫败（悲伤+惊讶）' },
      { id: 'sad_remorse', text: '悔恨', desc: '对自己过去行为的痛苦反思（悲伤+厌恶）' },
      { id: 'sad_despair', text: '绝望', desc: '对未来完全丧失信心' },
    ]
  },
  {
    name: '厌恶/排斥类',
    emoji: '🤢',
    items: [
      { id: 'disgust_boredom', text: '厌烦', desc: '对重复或无趣事物的轻微排斥' },
      { id: 'disgust_disgust', text: '厌恶', desc: '对令人反感事物的回避与排斥反应' },
      { id: 'disgust_loathing', text: '憎恶', desc: '极端的反感与深深的排斥' },
      { id: 'disgust_shame', text: '羞耻', desc: '将自己的行为或状态视为厌恶对象' },
      { id: 'disgust_embarrassment', text: '尴尬', desc: '社交中因不恰当而产生的不适感' },
    ]
  }
]

const currentCategory = ref(emotionCategories[0].name)

const currentCategoryEmotions = computed(() => {
  const cat = emotionCategories.find((c) => c.name === currentCategory.value)
  return cat ? cat.items : []
})

const selectedEmotions = ref<string[]>([])

const selectedEmotionItems = computed(() => {
  const items: { id: string; text: string }[] = []
  for (const cat of emotionCategories) {
    for (const item of cat.items) {
      if (selectedEmotions.value.includes(item.id)) {
        items.push(item)
      }
    }
  }
  return items
})

const toggleEmotion = (id: string) => {
  const index = selectedEmotions.value.indexOf(id)
  if (index === -1) {
    selectedEmotions.value.push(id)
  } else {
    selectedEmotions.value.splice(index, 1)
  }
}

const completeAndGo = () => {
  const emotionTexts = selectedEmotions.value
    .map((id) => {
      for (const category of emotionCategories) {
        const found = category.items.find((item) => item.id === id)
        if (found) return found.text
      }
      return id
    })
    .filter(Boolean)

  store.setEmotionTag(emotionTexts.join('|'))
  store.markInterventionCompleted()

  const routeParams = getRouteParams ? getRouteParams() : {}
  const taskIdFromRoute = routeParams.taskIdFromRoute
  const urgeLogId = routeParams.urgeLogId

  const query: Record<string, string> = {}
  if (taskIdFromRoute) query.taskId = taskIdFromRoute
  if (urgeLogId) query.urgeId = urgeLogId

  router.push({ path: '/result', query })
}
</script>