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
            <div class="input-container">
              <el-input
                v-model="search.name"
                style="width: 200px"
                size="large"
                placeholder="Tên sản phẩm"
                :suffix-icon="Search"
              />
              <el-input
                v-model="search.productCode"
                style="width: 200px"
                size="large"
                placeholder="Mã sản phẩm"
                :suffix-icon="Search"
              />
                <el-date-picker
                  v-model="search.startDate"
                  type="date"
                  placeholder="Ngày bắt đầu"
                  value-format="YYYY-MM-DD"
                />
                <el-date-picker
                  v-model="search.endDate"
                  type="date"
                  placeholder="Ngày kết thúc"
                  value-format="YYYY-MM-DD"
                />
              <el-radio-group v-model="search.status" style="margin-left: 20px;"  @change="fetchProduct">
                <el-radio :label="'0'">Hết</el-radio>
                <el-radio :label="'1'">Còn</el-radio>
              </el-radio-group>
            </div>
            <div class="button-container">
              <el-button
                :icon="Search"
                :style="{ backgroundColor: '#79bbff' }"
                style="height: 40px; color: white"
                @click="searchProducts"
              >
                Tìm kiếm
              </el-button>
              <el-button
                :icon="Download"
                :style="{ backgroundColor: '#79bbff' }"
                style="height: 40px; color: white"
                @click="exportProducts"
              >
                Xuất danh sách
              </el-button>
              <el-button
                :icon="Plus"
                :style="{ backgroundColor: '#79bbff' }"
                style="height: 40px; color: white"
                @click="addTab('Thêm sản phẩm', AddProduct)"
              >
                Thêm sản phẩm
              </el-button>
            </div>
          </div>

          <component
            :is="item.component"
            v-bind="item.props"
            :productId="currentProductId"
            :listProduct="listProduct"
            @edit-product="handleEditProduct"
            @view-product="handleViewProduct"
            @add-product-success="handleAddProductSuccess"
            @refresh-list="fetchProduct"
          />
        </el-tab-pane>
      </el-tabs>

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
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import ProductTable from '@/components/Product/ProductTable.vue';
import AddProduct from '@/components/Product/AddProduct.vue';
import ProductDetail from '@/components/Product/ProductDetail.vue';
import { Download, Plus, Search } from '@element-plus/icons-vue';

const search = ref({
  name: '',
  productCode: '',
  startDate: null as Date | null,
  endDate: null as Date | null,
  status: '1' // Mặc định là 'Còn'
});
const PRODUCT_URL = 'http://localhost:8080/api/product';
const listProduct = ref([]);
const pageSize = ref(5);
const totalProduct = ref(0);
const currentPages = ref(1);

const defaultTabName = '1';
const defaultTab = {
  title: 'Danh sách sản phẩm',
  name: defaultTabName,
  component: ProductTable
};

const currentProductId = ref<number | null>(null);

const fetchProduct = async (page = 1) => {

  try {
    page = Math.max(page, 1); // Đảm bảo currentPage không dưới 1
    const { data } = await axios.get(`${PRODUCT_URL}/search`, {
      params: {
        page: page - 1,
        size: pageSize.value,
        name: search.value.name,
        productCode: search.value.productCode,
        startDate: search.value.startDate ? search.value.startDate : '',
        endDate: search.value.endDate ? search.value.endDate : '',
        status: search.value.status
      }
    });
    listProduct.value = data.result.content;
    totalProduct.value = data.result.totalElements;
  } catch (err) {
    console.error('Error fetching products:', err);
  }
};

const searchProducts = () => {
  fetchProduct(1); // Fetch products with search criteria, reset to the first page
};

const handlePageChange = (page: number) => {
  currentPages.value = page;
  fetchProduct(page);
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  fetchProduct(1);
};

type Tab = {
  title: string;
  name: string;
  component: any;
  props?: Record<string, any>;
};

let tabIndex = 2;
const editableTabsValue = ref(defaultTabName);
const editableTabs = ref<Tab[]>([defaultTab]);

const addTab = (tabTitle: string, component: any = null, props: Record<string, any> = {}) => {
  const newTabName = `${++tabIndex}`;
  editableTabs.value.push({
    title: tabTitle,
    name: newTabName,
    component,
    props
  });
  editableTabsValue.value = newTabName;
};

const handleTabRemove = (targetName: string) => {
  if (targetName === defaultTabName) return;

  const tabs = editableTabs.value;
  let activeName = editableTabsValue.value;
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1];
        if (nextTab) {
          activeName = nextTab.name;
        }
      }
    });
  }

  editableTabsValue.value = activeName;
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName);
};

const handleEditProduct = (product: any) => {
  currentProductId.value = product.id;
  addTab('Sửa sản phẩm', ProductDetail, { isEditMode: true });
};

const handleViewProduct = (product: any) => {
  currentProductId.value = product.id;
  addTab('Chi tiết sản phẩm', ProductDetail, { isEditMode: false });
};

const handleAddProductSuccess = () => {
  const addProductTabIndex = editableTabs.value.findIndex(tab => tab.title === 'Thêm sản phẩm');
  if (addProductTabIndex !== -1) {
    editableTabs.value.splice(addProductTabIndex, 1);
  }

  editableTabsValue.value = defaultTabName;

  fetchProduct(currentPages.value);
}

const exportProducts = async () => {
  try {
    const response = await axios.get(`${PRODUCT_URL}/export`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products.xlsx');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Error exporting products:', error);
  }
}

onMounted(() => {
  fetchProduct();
});

watch(search, (newSearch) => {
  fetchProduct(1); // Fetch products with new search value
});
</script>


<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
}

.input-container {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping */
  gap: 10px; /* Spacing between elements */
  align-items: center; /* Align items in the center vertically */
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

