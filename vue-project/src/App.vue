<template>
  <div class="app-container">
    <!-- 添加顶部导航栏 -->
    <TopNavBar v-if="showNavBar" />
    <!-- 路由视图 -->
    <div class="main-content" :class="{ 'no-top-margin': !shouldApplyTopMargin }">
  <router-view></router-view>
    </div>
    <!-- 底部导航栏 -->
    <BottomNavBar v-if="showNavBar" />
    
    <!-- 添加悬浮发布按钮 -->
    <div class="floating-button" @click="goToPublish" v-if="showFloatingButton">
      <div class="custom-plus-button">
        <span class="horizontal-line"></span>
        <span class="vertical-line"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomNavBar from './components/BottomNavBar.vue'
import TopNavBar from './components/TopNavBar.vue'

const route = useRoute()
const router = useRouter()
// 计算属性：根据当前路由决定是否显示导航栏
const showNavBar = computed(() => {
  // 登录页和发布页面不显示导航栏
  const hiddenPaths = ['/login', '/publish']
  return !hiddenPaths.includes(route.path)
})
// 计算属性：根据当前路由决定是否显示悬浮按钮
const showFloatingButton = computed(() => {
  // 登录页、发布页面和聊天页面不显示悬浮按钮
  const hiddenButtonPaths = ['/login', '/publish', '/chat']
  return !hiddenButtonPaths.includes(route.path)
})
// 计算属性：根据当前路由决定是否应用顶部margin
const shouldApplyTopMargin = computed(() => {
  // 发布页面不需要顶部margin
  const noMarginPaths = ['/publish']
  return !noMarginPaths.includes(route.path)
})
// 跳转到发布页面
const goToPublish = () => {
  router.push('/publish')
}
</script>
<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  padding-bottom: 60px; /* 为底部导航栏预留空间 */
}

.main-content {
  margin-top: 60px; /* 为顶部导航栏预留空间 */
}

.no-top-margin {
  margin-top: 0 !important;
}

/* 添加悬浮按钮样式 */
.floating-button {
  position: fixed;
  right: 40px;
  bottom: 80px;
  z-index: 1000;
}

/* 自定义圆形加号按钮 */
.custom-plus-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(145deg, #3a8ee6, #409eff);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

/* 水平线和垂直线形成加号 */
.horizontal-line, .vertical-line {
  background-color: white;
  position: absolute;
  border-radius: 6px;
  box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
}

.horizontal-line {
  width: 26px;
  height: 6px;
}

.vertical-line {
  width: 6px;
  height: 26px;
}

/* 悬停效果 */
.custom-plus-button:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.6);
  background: linear-gradient(145deg, #409eff, #3a8ee6);
}

.custom-plus-button:hover .horizontal-line,
.custom-plus-button:hover .vertical-line {
  box-shadow: 0 0 6px rgba(255, 255, 255, 1);
}

/* 点击效果 */
.custom-plus-button:active {
  transform: scale(0.95) rotate(90deg);
}
</style> 