<template>
  <div class="global-search">
    <el-input
      v-model="keyword"
      placeholder="搜索商品或当前页面内容"
      clearable
      @keyup.enter="search"
    >
      <template #prepend>
        <el-select v-model="searchType" style="width: 115px">
          <el-option label="商品搜索" value="product" />
          <el-option label="页面内容" value="page" />
        </el-select>
      </template>
      <template #append>
        <el-button @click="search">
          <el-icon><Search /></el-icon>
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  defaultKeyword: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['search'])

const router = useRouter()
const route = useRoute()
const keyword = ref(props.defaultKeyword || '')
const searchType = ref('product') // 默认搜索商品

// 监听defaultKeyword变化
watch(() => props.defaultKeyword, (newVal) => {
  keyword.value = newVal
})

// 搜索方法
const search = () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  if (searchType.value === 'product') {
    // 商品搜索
    if (route.path === '/search') {
      // 如果已经在搜索页面，触发搜索事件
      emit('search', keyword.value)
    } else {
      // 否则导航到搜索页面
      router.push({
        path: '/search',
        query: { 
          keyword: keyword.value,
          timestamp: Date.now() // 添加时间戳防止路由不刷新
        }
      })
    }
  } else {
    // 页面内容搜索
    searchPageContent(keyword.value)
  }
}

// 页面内容搜索
const searchPageContent = (text) => {
  // 移除之前的高亮
  removeHighlights()
  
  if (!text.trim()) return
  
  const searchText = text.toLowerCase()
  const bodyText = document.body.innerHTML
  
  // 如果没有找到匹配内容
  if (bodyText.toLowerCase().indexOf(searchText) === -1) {
    ElMessage.info('当前页面未找到匹配内容')
    return
  }
  
  // 创建一个遍历DOM的函数
  const walkDOM = (node, func) => {
    func(node)
    node = node.firstChild
    while (node) {
      walkDOM(node, func)
      node = node.nextSibling
    }
  }
  
  // 匹配计数
  let matchCount = 0
  
  // 遍历DOM，查找文本节点并高亮匹配内容
  walkDOM(document.body, (node) => {
    if (node.nodeType === 3) { // 文本节点
      const textContent = node.nodeValue
      if (textContent.toLowerCase().indexOf(searchText) > -1) {
        const highlightedText = document.createElement('span')
        highlightedText.innerHTML = textContent.replace(
          new RegExp(searchText, 'gi'), 
          match => `<mark class="global-search-highlight">${match}</mark>`
        )
        highlightedText.classList.add('search-highlight-wrapper')
        
        if (node.parentNode) {
          node.parentNode.replaceChild(highlightedText, node)
          matchCount++
        }
      }
    }
  })
  
  // 显示匹配数量
  if (matchCount > 0) {
    ElMessage.success(`在当前页面找到 ${matchCount} 处匹配内容`)
    
    // 滚动到第一个匹配项
    const firstMatch = document.querySelector('.global-search-highlight')
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  } else {
    ElMessage.info('当前页面未找到匹配内容')
  }
}

// 移除高亮
const removeHighlights = () => {
  const highlights = document.querySelectorAll('.search-highlight-wrapper')
  highlights.forEach(el => {
    const parent = el.parentNode
    if (parent) {
      // 保留原始文本
      const text = el.textContent || ''
      const textNode = document.createTextNode(text)
      parent.replaceChild(textNode, el)
    }
  })
}

// 组件卸载时清除高亮
onUnmounted(() => {
  removeHighlights()
})
</script>

<style>
/* 全局样式，不使用scoped，确保高亮样式生效 */
.global-search-highlight {
  background-color: #ffd04b;
  color: #000;
  padding: 2px 0;
  border-radius: 2px;
  font-weight: bold;
}
</style>

<style scoped>
.global-search {
  width: 450px;
}
</style> 