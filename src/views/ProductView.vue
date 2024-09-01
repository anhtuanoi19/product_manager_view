<template>
  <div>
    <el-card>
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        class="custom-tabs"
        closable
        @click="fetchProduct"
        lazy
        @tab-remove="handleTabRemove"
      >
        <el-tab-pane
          v-for="item in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >

        </el-tab-pane>
      </el-tabs>

      <div v-if="editableTabsValue === defaultTabName" class="container">
        <el-input
          v-model="search"
          style="width: 340px"
          size="large"
          placeholder="Tìm kiếm sản phẩm"
          :suffix-icon="Search"
        />
        <div class="button-container">
          <el-button :icon="Download" :style="{backgroundColor: '#79bbff'}" style="height: 40px; color: white">
            Xuất danh sách
          </el-button>
          <el-button :icon="Plus" :style="{backgroundColor: '#79bbff'}" style="height: 40px; color: white"
                     @click="addTab('Thêm sản phẩm', AddProduct)" >
            Thêm sản phẩm
          </el-button>
        </div>
      </div>

      <div class="table-container">
        <component :is="editableTabs.find(tab => tab.name === editableTabsValue)?.component" :listProduct="listProduct"
                   @edit-product="handleEditProduct" @view-product="handleViewProduct" />
      </div>

      <el-pagination
        v-if="editableTabsValue === defaultTabName"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
        :current-page="currentPages"
        :page-size="pageSize"
        :total="totalProduct"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 50]"
        class="mt-3"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ProductTable from '@/components/Product/ProductTable.vue'
import AddProduct from '@/components/Product/AddProduct.vue'
import { Download, Plus, Search } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

const search = ref('')
const PRODUCT_URL = 'http://localhost:8080/api/product'
const listProduct = ref([])
const pageSize = ref(5)
const totalProduct = ref(0)
const currentPages = ref(1)

const defaultTabName = '1'
const defaultTab = {
  title: 'Danh sách sản phẩm',
  name: defaultTabName,
  component: ProductTable
}

const fetchProduct = async (page = 1) => {
  try {
    const { data } = await axios.get(PRODUCT_URL, {
      params: {
        page: page - 1,
        size: pageSize.value
      }
    })
    listProduct.value = data.result.content
    totalProduct.value = data.result.totalElements
  } catch (err) {
    console.log(err)
  }
}


const handlePageChange = (page: number) => {
  currentPages.value = page
  fetchProduct(page)
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  fetchProduct(1)
}

const indexMethod = (index: number) => {
  return (currentPages.value - 1) * pageSize.value + index + 1
}

let tabIndex = 2
const editableTabsValue = ref(defaultTabName)
const editableTabs = ref([
  defaultTab
])

const addTab = (tabTitle: string, component: any = null) => {
  const newTabName = `${++tabIndex}`
  editableTabs.value.push({
    title: tabTitle,
    name: newTabName,
    component
  })
  editableTabsValue.value = newTabName
}

const handleTabRemove = (targetName: string) => {
  if (targetName === defaultTabName) return // Prevent removal of default tab

  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
}

const handleEditProduct = (product: any) => {
  console.log('Edit product', product)
  addTab('Sửa sản phẩm', AddProduct)
}

const handleViewProduct = (product: any) => {
  console.log('View product', product)
  addTab('Chi tiết sản phẩm', AddProduct)
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.button-container {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.table-container {
  margin-top: 16px;
}
</style>
