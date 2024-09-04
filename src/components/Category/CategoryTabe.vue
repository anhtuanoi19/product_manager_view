<!-- productTable.vue -->
<template>
  <el-table ref="tableRef" :data="listCategory" style="width: 100%">
    <el-table-column prop="name" label="Catego code" />
    <el-table-column prop="categoryCode" label="Catego name" />
    <el-table-column prop="description" label="Description" />
    <el-table-column
      prop="status"
      label="Status"
      width="100"
      filter-placement="bottom-end"
    >
      <template #default="scope">
        <el-tag
          :type="scope.row.status === '0' ? 'danger' : 'success'"
          disable-transitions
        >
          {{ scope.row.status === '1' ? 'Còn' : 'Hết' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Action" #default="scope">
      <el-button
        :style="{backgroundColor: '#a0cfff'}"
        :icon="Edit"
        circle
        @click="editCategory(scope.row)"
      />
      <el-button
        :style="{backgroundColor: '#fab6b6'}"
        :icon="Delete"
        circle
      />
      <el-button
        :style="{backgroundColor: '#d1edc4'}"
        circle
        @click="viewCategory(scope.row)"
      >
        <el-icon>
          <Document />
        </el-icon>
      </el-button>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Edit, Delete, Document } from '@element-plus/icons-vue';

const props = defineProps({
  listCategory: Array // Nhận dữ liệu sản phẩm từ parent component
});

const emit = defineEmits<{
  (e: 'edit-category', category: any): void
  (e: 'view-category', category: any): void
}>()

const editCategory = (category: any) => {
  emit('edit-category', category)
}

const viewCategory = (category: any) => {
  emit('view-category', category)
}
</script>

<style scoped>
/* Add any specific styles for CategoTable here */
</style>
