<template>
  <el-table ref="tableRef" row-key="date" :data="listProduct" style="width: 100%">
    <el-table-column prop="productCode" label="Product code" />
    <el-table-column prop="productName" label="Product name" />
    <el-table-column prop="categoryName" label="Category" />
    <el-table-column prop="quantity" label="Quantity" />
    <el-table-column prop="description" label="Description" />
    <el-table-column prop="price" label="Price" />
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
        >{{ scope.row.status === 1 ? 'Còn' : 'Hết' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Action" #default="scope">
      <el-button :style="{backgroundColor: '#a0cfff'}" :icon="Edit" circle @click="editProduct(scope.row)" />
      <el-button :style="{backgroundColor: '#fab6b6'}" :icon="Delete" circle />
      <el-button :style="{backgroundColor: '#d1edc4'}" circle @click="viewProduct(scope.row)">
        <el-icon>
          <Document />
        </el-icon>
      </el-button>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { ElTable, ElTableColumn, ElTag, ElButton, ElIcon } from 'element-plus';
import { Edit, Delete, Document } from '@element-plus/icons-vue';

const props = defineProps({
  listProduct: Array
});

const emit = defineEmits(['edit-product', 'view-product']);

const editProduct = (product: any) => {
  emit('edit-product', product);
};

const viewProduct = (product: any) => {
  emit('view-product', product);
};
</script>

<style scoped>
/* Add any specific styles for ProductTable here */
</style>
