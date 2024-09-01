<template>
  <el-row>
    <el-col :span="12">
      <div class="demo-image__placeholder">
        <div class="block">
          <el-image :src="src" />
          <el-input v-model="src" placeholder="Enter image URL" style="width: 300px"/>
        </div>
        <div class="block">
          <el-image :src="src1" />
          <el-input v-model="src1" placeholder="Enter image URL" style="width: 300px"/>
        </div>
        <div class="block">
          <el-image :src="src2" />
          <el-input v-model="src2" placeholder="Enter image URL" style="width: 300px"/>
        </div>
        <div class="block">
          <el-image :src="src3" />
          <el-input v-model="src3" placeholder="Enter image URL" style="width: 300px" />
        </div>
      </div>
    </el-col>

    <el-col :span="12">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
      >
        <el-form-item label="Product name" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>

        <el-form-item label="Price" prop="price">
          <el-input v-model="ruleForm.price" />
        </el-form-item>

        <el-form-item label="Quantity" prop="quantity">
          <el-input v-model="ruleForm.quantity" />
        </el-form-item>

        <el-row :gutter="10">
          <el-col :span="21">
            <el-form-item label="Category" prop="category">
              <el-select
                v-model="ruleForm.category"
                :options="categoryOptions"
                placeholder="Please select"
                style="width: 100%"
                multiple
                collapse-tags
                clearable
                collapse-tags-tooltip
                :max-collapse-tags="4"
              >
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-button plain @click="dialogFormVisible = true">
              Thêm
            </el-button>
          </el-col>
        </el-row>

        <el-form-item label="Status" prop="status">
          <el-switch
            v-model="ruleForm.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input v-model="ruleForm.description" type="textarea" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="confirmSubmit">
            Create
          </el-button>
          <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>

  <el-dialog v-model="dialogFormVisible" title="Add Category" width="500">
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="Category name" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="Category code" prop="categoryCode">
        <el-input v-model="form.categoryCode" />
      </el-form-item>

      <el-form-item label="Instant delivery" prop="status">
        <el-switch v-model="form.status" />
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addCategory">
          Create
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="dialogVisible"
    title="Confirm"
    width="500"
    :before-close="handleClose"
  >
    <span>Are you sure you want to create this product?</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox, ElNotification, type FormInstance, type FormRules } from 'element-plus'
import axios from 'axios'
import { watch } from 'vue'

const form = reactive({
  categoryCode: '',
  name: '',
  description: '',
  status: false
})

interface RuleForm {
  name: string
  price: number
  quantity: number
  category: number[]
  status: number
  description: string
  images: string[]
}

interface Images {
  url: string
}

interface Category {
  id: number
  categoryCode: string
  name: string
  status: string
  description: string
}

const CATEGORY_URL = 'http://localhost:8080/api/category'
const PRODUCT_URL = 'http://localhost:8080/api/product'
const src = ref<string>('')
const src1 = ref<string>('')
const src2 = ref<string>('')
const src3 = ref<string>('')
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const images = ref<Images[]>([])
const categoryOptions = ref<Category[]>([])

const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const dialogVisible = ref(false)
const ruleForm = reactive<RuleForm>({
  name: '',
  price: 0,
  quantity: 0,
  category: [],
  status: 0,
  description: '',
  images: []
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    const productData = {
      name: ruleForm.name,
      price: ruleForm.price,
      quantity: ruleForm.quantity,
      categories: ruleForm.category,
      status: ruleForm.status,
      description: ruleForm.description,
      images: images.value
    };

    if (valid) {
      try {
        await axios.post(PRODUCT_URL, productData);
        ElNotification({
          title: 'Success',
          message: 'Product created successfully',
          type: 'success',
        });

        dialogVisible.value = false;
        resetForm(formEl);

      } catch (error) {
        ElNotification({
          title: 'Error',
          message: 'Failed to create product',
          type: 'error',
        });
      }
    } else {
      ElNotification({
        title: 'Error',
        message: 'Form validation failed',
        type: 'error',
      });
    }
  });
};

const confirmSubmit = () => {
  dialogVisible.value = true
}

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('Are you sure you want to close this dialog?')
    .then(() => {
      done()
    })
    .catch(() => {
      // Do nothing on cancel
    })
}

const addCategory = () => {
  const newCategory = {
    categoryCode: form.categoryCode,
    name: form.name,
    description: form.description,
    status: form.status ? 'active' : 'inactive', // Adjust status to match Category type
    id: categoryOptions.value.length + 1 // Fake ID for the new category
  };

  categoryOptions.value.push(newCategory);

  ruleForm.category.push(newCategory.id);

  form.categoryCode = '';
  form.name = '';
  form.description = '';
  form.status = false;

  // Close the dialog
  dialogFormVisible.value = false;
};

watch([src, src1, src2, src3], ([newSrc, newSrc1, newSrc2, newSrc3]) => {
  images.value = []

  if (newSrc) {
    images.value.push({ url: newSrc })
  }
  if (newSrc1) {
    images.value.push({ url: newSrc1 })
  }
  if (newSrc2) {
    images.value.push({ url: newSrc2 })
  }
  if (newSrc3) {
    images.value.push({ url: newSrc3 })
  }
})

const fetchCategoryOptions = async () => {
  try {
    const { data } = await axios.get(`${CATEGORY_URL}/findAll`)
    categoryOptions.value = data.result
  } catch (err) {
    console.error(err)
  }
}

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Please input product name', trigger: 'blur' }
  ],
  price: [
    { required: true, type: 'number', message: 'Please input price', trigger: 'blur' }
  ],
  quantity: [
    { required: true, type: 'number', message: 'Please input quantity', trigger: 'blur' }
  ],
  category: [
    { type: 'array', required: true, message: 'Please select at least one category', trigger: 'change' }
  ],
  status: [
    { required: true, type: 'number', message: 'Please select status', trigger: 'change' }
  ],
  description: [
    { required: true, message: 'Please input description', trigger: 'blur' }
  ]
})

const resetForm = (formEl: FormInstance | undefined) => {
  if (formEl) {
    formEl.resetFields()
  }
}

onMounted(() => {
  fetchCategoryOptions()
})
</script>

<style scoped>
.demo-image__placeholder {
  text-align: center;
}
.block {
  margin-bottom: 20px;
}
</style>
