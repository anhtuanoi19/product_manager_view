<template>
  <el-table ref="tableRef" :data="listCategory" style="width: 100%">
    <el-table-column prop="name" label="Tên danh mục" />
    <el-table-column prop="categoryCode" label="Mã danh mục" />
    <el-table-column prop="description" label="Mô tả" />
    <el-table-column
      prop="status"
      label="Trạng thái"
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
    <el-table-column label="Hành động" #default="scope">
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
        @click="confirmDeleteCategory(scope.row.id)"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  listCategory: Array // Nhận dữ liệu từ parent component
});

const emit = defineEmits<{
  (e: 'edit-category', category: any): void
  (e: 'view-category', category: any): void
  (e: 'refresh-list'): void;

}>()

const editCategory = (category: any) => {
  emit('edit-category', category)
}

const viewCategory = (category: any) => {
  emit('view-category', category)
}

const confirmDeleteCategory = (categoryId: number) => {
  ElMessageBox.confirm(
    'Bạn có chắc chắn muốn xóa danh mục này không?',
    'Xác nhận',
    {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }
  )
    .then(() => {
      handleDeleteCategory(categoryId);
    })
    .catch(() => {
      ElMessage.info('Hủy bỏ xóa danh mục');
    });
};

const handleDeleteCategory = async (categoryId: number) => {
  try {
    await axios.delete(`http://localhost:8080/api/category/xoa-mem/${categoryId}`);
    ElMessage.success('Xóa sản phẩm thành công!');
    emit('refresh-list'); // Trigger refresh list event
  } catch (error) {
    console.error('Có lỗi xảy ra khi xóa sản phẩm:', error);
    ElMessage.error('Có lỗi xảy ra khi xóa sản phẩm!');
  }
};
</script>

<style scoped>
/* Add any specific styles for CategoryTable here */
</style>
