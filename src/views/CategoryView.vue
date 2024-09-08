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
          <el-row gutter="30">
            <el-col span="6">
              <el-input
                v-model="searchName"
                style="max-width: 100%"
                placeholder="Tên danh mục"
                class="input-with-select"
              >
                <template #append>
                  <el-button :icon="Search" @click="getAllCategory()"/>
                </template>
              </el-input>
            </el-col>
            <el-col span="6">
              <el-input
                v-model="categoryCode"
                style="max-width: 100%"
                placeholder="Mã danh mục"
                class="input-with-select"
              >
                <template #append>
                  <el-button :icon="Search" @click="getAllCategory()"/>
                </template>
              </el-input>
            </el-col>
            <el-col span="12">
              <el-date-picker
                v-model="startDate"
                type="datetime"
                placeholder="Ngày bắt đầu"
                format="YYYY-MM-DD HH:mm:ss"
                date-format="MMM DD, YYYY"
                time-format="HH:mm"
              />
            </el-col>
              <el-col span="12">
                <el-date-picker
                  v-model="endDate"
                  type="datetime"
                  placeholder="Ngày kết thúc"
                  format="YYYY-MM-DD HH:mm:ss"
                  date-format="MMM DD, YYYY"
                  time-format="HH:mm"
                />
              </el-col>
              <el-button :icon="Search" @click="getAllCategory()"/>
          </el-row>



            <div class="mb-2 ml-4">
              <el-radio-group v-model="status">
                <el-radio value="1" size="large" @change="getAllCategory" >Còn</el-radio>
                <el-radio value="0" size="large" @change="getAllCategory">Hết</el-radio>
              </el-radio-group>
            </div>
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
            @refresh-list="getAllCategory"
            @add-category-success="handleAddCategorySuccess"
          />
        </el-tab-pane>
      </el-tabs>

      <el-pagination
        class="mt-3"
        v-model:current-page="page.currentPage"
        v-model:page-size="page.pageSize"
        :page-sizes="[1, 5, 10]"
        :size="size"
        :background="true"
        layout="total, sizes, prev, pager, next"
        :total="page.totalElement"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue'
import axios from 'axios'
import AddCategory from '@/components/Category/AddCategory.vue'
import CategoryTabe from '@/components/Category/CategoryTabe.vue'
import { Download, Plus, Search } from '@element-plus/icons-vue'
import UpdateCategory from '@/components/Category/UpdateCategory.vue'
import type { ComponentSize } from 'element-plus'
import dayjs from 'dayjs'

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
const formattedEndDate = ref('')
const formattedStartDate = ref('')


const currentCategoryId = ref<number | null>(null)

const category = ref([])
const searchName = ref('')
const size = ref<ComponentSize>('default')
const visible = ref(false)
const deleteCategoryId = ref()
const selectedOptions = ref([]);

const categoryCode = ref('');
const startDate = ref('')
const endDate = ref('')
const status = ref()

const viewFilter = reactive({
  categoryCode: false,
  startDate: false,
  endDate: false,
});

watch(endDate, (newDate) => {
  if (newDate) {
    formattedEndDate.value = dayjs(newDate).format('YYYY-MM-DD') // Định dạng lại thành 'yyyy-MM-dd'
  }
})

watch(startDate, (newDate) => {
  if (newDate) {
    formattedStartDate.value = dayjs(newDate).format('YYYY-MM-DD') // Định dạng lại thành 'yyyy-MM-dd'
  }
})

const page = reactive({
  currentPage: 1,
  pageSize: 5,
  totalElement: 0
})
const URL_CATEGORY = "http://localhost:8080/api/category"
const getAllCategory = async () => {
  try {
    // Giảm currentPage trước khi lấy dữ liệu
    page.currentPage = Math.max(page.currentPage, 1); // Đảm bảo currentPage không dưới 1

    const params = new URLSearchParams({
      name: searchName.value,
      categoryCode: categoryCode.value,
      status: status.value,
      page: String(page.currentPage - 1),
      size: String(page.pageSize)
    })
    params.append('endDate', formattedEndDate.value)
    params.append('startDate', formattedStartDate.value)
    const {data} = await axios.get(`${URL_CATEGORY}/search`, {params})

    category.value = data?.result?.content ?? []
    page.totalElement = data?.result?.totalElements

    const pageable = data?.result?.pageable
    page.currentPage = pageable.pageNumber + 1
    page.pageSize = pageable.pageSize
    listCategory.value = data.result.content
    console.log(data)
    if (category.value.length === 0) {
      console.warn('No students found or response structure is incorrect.')
    }
  } catch (error) {
    console.error('Failed to fetch students:', error)
  }
}

const handleSizeChange = (val: number) => {
  page.pageSize = val
  page.currentPage = 1
  getAllCategory()
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  page.currentPage = val
  getAllCategory()
  console.log(`current page: ${val}`)
}

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
const handleEditCategory = (category: any) => {
  currentCategoryId.value = category.id;
  addTab('Sửa danh mục', UpdateCategory, { isEditMode: false, category });
}

const handleViewCategory = (category: any) => {
  currentCategoryId.value = category.id;
  addTab('Chi tiết danh mục', UpdateCategory, { isEditMode: true, category });
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


const handleAddCategorySuccess = () => {
  editableTabs.value = editableTabs.value.filter(tab => tab.name !== 'AddCategory')
  editableTabsValue.value = defaultTabName
  getAllCategory()
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
  status.value = 1
  getAllCategory()
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
