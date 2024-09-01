<template>
  <div id="app-container">
    <el-menu
      active-text-color="#ffd04b"
      background-color="#545c64"
      class="el-menu-vertical-demo"
      default-active="2"
      text-color="#fff"
      @open="handleOpen"
      @close="handleClose"
    >
      <router-link to="/san-pham" style="color: inherit; text-decoration: none;">
        <el-menu-item index="1">
          <el-icon>
            <icon-menu />
          </el-icon>
          <span>Sản phẩm</span>
        </el-menu-item>
      </router-link>
      <router-link to="/danh-muc" style="color: inherit; text-decoration: none;">
        <el-menu-item index="2">
          <el-icon>
            <document />
          </el-icon>
          <span>Danh mục</span>
        </el-menu-item>
      </router-link>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting
} from '@element-plus/icons-vue'

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
#app-container {
  display: flex;
  height: 100vh; /* Chiều cao toàn màn hình */
}
</style>