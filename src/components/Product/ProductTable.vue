<template>
  <el-table ref="tableRef" :data="listProduct" style="width: 100%">
    <el-table-column prop="productCode" label="Mã sản phẩm" />
    <el-table-column prop="productName" label="Tên sản phẩm" />
    <el-table-column prop="categoryName" label="Danh mục" />
    <el-table-column prop="quantity" label="Số lượng" />
    <el-table-column prop="description" label="Mô tả" />
    <el-table-column prop="price" label="Giá" />
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
        @click="editProduct(scope.row)"
      />
      <el-button
        :style="{backgroundColor: '#fab6b6'}"
        :icon="Delete"
        circle
        @click="confirmDeleteProduct(scope.row.id)"
      />
      <el-button
        :style="{backgroundColor: '#d1edc4'}"
        circle
        @click="viewProduct(scope.row)"
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
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

// Define props with listProduct
const props = defineProps({
  listProduct: Array as () => any[] // Make sure this matches your product structure
});

// Define emits
const emit = defineEmits<{
  (e: 'edit-product', product: any): void;
  (e: 'view-product', product: any): void;
  (e: 'refresh-list'): void;
}>();

// Define methods
const viewProduct = (product: any) => {
  emit('view-product', product);
};

const editProduct = (product: any) => {
  emit('edit-product', product);
};

const confirmDeleteProduct = (productId: number) => {
  ElMessageBox.confirm(
    'Bạn có chắc chắn muốn xóa sản phẩm này không?',
    'Xác nhận',
    {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }
  )
    .then(() => {
      handleDeleteProduct(productId);
    })
    .catch(() => {
      ElMessage.info('Hủy bỏ xóa sản phẩm');
    });
};

const handleDeleteProduct = async (productId: number) => {
  try {
    await axios.delete(`http://localhost:8080/api/product/xoa-mem/${productId}`);
    ElMessage.success('Xóa sản phẩm thành công!');
    emit('refresh-list'); // Trigger refresh list event
  } catch (error) {
    console.error('Có lỗi xảy ra khi xóa sản phẩm:', error);
    ElMessage.error('Có lỗi xảy ra khi xóa sản phẩm!');
  }
};
</script>

<style scoped>
/* Add any specific styles for ProductTable here */
</style>
