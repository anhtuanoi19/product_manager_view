<template>
  <div>
    <el-card>
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        class="custom-tabs"
        closable
        lazy
        @tab-remove="handleTabRemove"
      >
        <el-tab-pane
          v-for="item in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >
          <div v-if="editableTabsValue === defaultTabName" class="search-container">
            <el-input
              v-model="search"
              style="width: 340px"
              size="large"
              placeholder="Tìm kiếm danh mục"
              :suffix-icon="Search"
            />
            <div class="button-container">
              <el-button
                :icon="Download"
                :style="{ backgroundColor: '#79bbff' }"
                style="height: 40px; color: white"
                @click="exportCategories"
              >
                Xuất danh sách
              </el-button>
              <el-button
                :icon="Plus"
                :style="{ backgroundColor: '#79bbff' }"
                style="height: 40px; color: white"
                @click="addTab('Thêm danh mục', AddCategory)"
              >
                Thêm danh mục
              </el-button>
            </div>
          </div>

          <component
            :is="item.component"
            v-bind="item.props"
            :categoryId="currentCategoryId"
            :listCategory="listCategory"
            @edit-category="handleEditCategory"
            @view-category="handleViewCategory"
            @refresh-list="fetchCategories"
            @add-category-success="handleAddCategorySuccess"
          />
        </el-tab-pane>
      </el-tabs>

      <el-pagination
        v-if="editableTabsValue === defaultTabName"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
        :current-page="currentPages"
        :page-size="pageSize"
        :total="totalCategory"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 50]"
        class="mt-3"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import AddCategory from '@/components/Category/AddCategory.vue'
import CategoryTabe from '@/components/Category/CategoryTabe.vue'
import { Download, Plus, Search } from '@element-plus/icons-vue'
import UpdateCategory from '@/components/Category/UpdateCategory.vue'

const search = ref('')
const CATEGORY_URL = 'http://localhost:8080/api/category'
const listCategory = ref([])
const pageSize = ref(5)
const totalCategory = ref(0)
const currentPages = ref(1)

const defaultTabName = '1'
const defaultTab = {
  title: 'Danh sách danh mục',
  name: defaultTabName,
  component: CategoryTabe
}

const currentCategoryId = ref<number | null>(null)

const fetchCategories = async (page = 1, searchTerm = '') => {
  try {
    const { data } = await axios.get(`${CATEGORY_URL}/search`, {
      params: {
        name: searchTerm,
        page: page - 1,
        size: pageSize.value,
      }
    })
    listCategory.value = data.result.content
    totalCategory.value = data.result.totalElements
  } catch (err) {
    console.log(err)
  }
}

const handlePageChange = (page: number) => {
  currentPages.value = page
  fetchCategories(page, search.value)
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  fetchCategories(1, search.value)
}

// Theo dõi sự thay đổi của `search` và gọi API tương ứng
watch(search, (newValue) => {
  fetchCategories(1, newValue)
})

type Tab = {
  title: string;
  name: string;
  component: any;
  props?: Record<string, any>;
}

let tabIndex = 2
const editableTabsValue = ref(defaultTabName)
const editableTabs = ref<Tab[]>([defaultTab]);

const addTab = (tabTitle: string, component: any = null, props: Record<string, any> = {}) => {
  const newTabName = `${++tabIndex}`
  editableTabs.value.push({
    title: tabTitle,
    name: newTabName,
    component,
    props
  })
  editableTabsValue.value = newTabName
}

const handleTabRemove = (targetName: string) => {
  if (targetName === defaultTabName) return

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

const handleEditCategory = (category: any) => {
  currentCategoryId.value = category.id
  addTab('Sửa danh mục', UpdateCategory, { isEditMode: true })
}

const handleViewCategory = (category: any) => {
  currentCategoryId.value = category.id
  addTab('Chi tiết danh mục', UpdateCategory, { isEditMode: false })
}

const handleAddCategorySuccess = () => {
  editableTabs.value = editableTabs.value.filter(tab => tab.name !== 'AddCategory')
  editableTabsValue.value = defaultTabName
  fetchCategories()
}

const exportCategories = async () => {
  try {
    const response = await axios.get(`${CATEGORY_URL}/export`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'categories.xlsx')
    document.body.appendChild(link)
    link.click()
  } catch (error) {
    console.error('Error exporting categories:', error)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
}

.button-container {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  margin-left: auto; /* Ensure buttons are aligned to the end of the container */
}

.table-container {
  margin-top: 16px;
}
</style>
