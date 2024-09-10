<template>
  <el-row>
    <!-- Phần upload hình ảnh -->
    <el-col :span="12">
      <div class="image-upload-container">
        <input
          ref="fileInputRef"
          type="file"
          multiple
          @change="handleFileChange"
          style="display: none;"
        />
        <div
          v-if="imagePreviews.length === 0"
          class="upload-placeholder"
          @click="triggerFileInput"
        >
          <el-button type="primary">Upload Images</el-button>
        </div>
        <div v-else class="image-grid">
          <div v-for="(image, index) in imagePreviews" :key="index" class="image-item">
            <img :src="image" alt="preview" />
            <el-button
              type="danger"
              class="remove-button"
              @click="removeImage(index)"
            >
              Remove
            </el-button>
          </div>
        </div>
      </div>

      <div class="text">
        <p><strong>Name:</strong> {{ ruleForm.name }}</p>
        <p><strong>Price:</strong> {{ ruleForm.price }}</p>
        <p><strong>Category Name:</strong> {{ getCategoryNames() }}</p>
        <p><strong>Quantity:</strong> {{ ruleForm.quantity }}</p>
        <p><strong>Description:</strong> {{ ruleForm.description }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="ruleForm.status ? 'status-active' : 'status-inactive'">
          {{ ruleForm.status ? ' Active' : ' Inactive' }}
          </span>
        </p>
      </div>
    </el-col>

    <!-- Phần form thông tin sản phẩm -->
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

        <el-form-item label="Product Code" prop="productCode">
          <el-input v-model="ruleForm.productCode" />
        </el-form-item>

        <el-form-item label="Price" prop="price">
          <el-input v-model.number="ruleForm.price" type="number" />
        </el-form-item>

        <el-form-item label="Quantity" prop="quantity">
          <el-input v-model.number="ruleForm.quantity" type="number" />
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
              Add
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
    <el-form :model="form" label-width="auto" style="max-width: 600px" :rules="categoryRules">
      <el-form-item label="Category code" prop="categoryCode">
        <el-input v-model="form.categoryCode" />
      </el-form-item>

      <el-form-item label="Category name" prop="name">
        <el-input v-model="form.name" />
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
import { ElMessage, ElMessageBox, ElNotification, type FormInstance, type FormRules } from 'element-plus'
import axios from 'axios'

const form = reactive({
  categoryCode: '',
  name: '',
  description: '',
  status: false
})

const emit = defineEmits(['productAdded'])

const getCategoryNames = () => {
  return ruleForm.category.map(catId => {
    const category = categoryOptions.value.find(option => option.id === catId)
    return category ? category.name : ''
  }).join(', ')
}

interface RuleForm {
  name: string
  productCode: string
  price: number
  quantity: number
  category: number[]
  status: number
  description: string
  images: File[]
}

interface Category {
  id: number // Ensure the id is treated as a number
  categoryCode: string
  name: string
  status: string
  description: string
}

const CATEGORY_URL = 'http://localhost:8080/api/category'
const PRODUCT_URL = 'http://localhost:8080/api/product'

const dialogFormVisible = ref(false)
const dialogVisible = ref(false)
const imagePreviews = ref<string[]>([])
const categoryOptions = ref<Category[]>([])

const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  productCode: '',
  price: 0,
  quantity: 0,
  category: [],
  status: 0,
  description: '',
  images: []
});
const serverError = ref('');

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  const validCategories = ruleForm.category.map(cat => {
    const existingCategory = categoryOptions.value.find(option => option.id === cat)
    return existingCategory || { id: cat }
  })

  await formEl.validate(async (valid) => {
    if (valid) {
      const formData = new FormData()
      formData.append('data', JSON.stringify({
        name: ruleForm.name,
        productCode: ruleForm.productCode,
        description: ruleForm.description,
        price: ruleForm.price,
        quantity: ruleForm.quantity,
        status: ruleForm.status,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'admin',
        modifiedBy: 'admin',
        categories: validCategories,
        images: []
      }))
      ruleForm.images.forEach((file) => {
        formData.append('images', file)
      })

      try {
        const response = await axios.post(`${PRODUCT_URL}/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        ElNotification({
          title: 'Success',
          message: 'Product created successfully',
          type: 'success'
        })

        dialogVisible.value = false
        resetForm(formEl)

        // Gửi sự kiện productAdded lên parent component
        emit('productAdded')

      } catch (error: any) {
        serverError.value = error.response?.data?.message || 'Error creating category';
        ElMessage.error(error.response ? error.response.data : error.message);
      }
    } else {
      ElNotification({
        title: 'Error',
        message: 'Form validation failed',
        type: 'error'
      })
    }
  })
}

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

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    ruleForm.images = Array.from(target.files)
    imagePreviews.value = ruleForm.images.map(file => URL.createObjectURL(file))
  }
}

const removeImage = (index: number) => {
  ruleForm.images.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const categoryRules = reactive({
  categoryCode: [
    { required: true, message: 'Vui lòng nhập mã danh mục', trigger: 'blur' },
    { min: 3,max: 100, message: 'Code phải từ 3 đến 100 ký tự', trigger: 'blur' }

  ],
  name: [
    { required: true, message: 'Vui lòng nhập tên danh mục', trigger: 'blur' },
    { min:3,max: 100, message: 'Mô tả phải từ 3 quá 100 ký tự', trigger: 'blur' }

  ],
  description: [
    { required: true, message: 'Vui lòng nhập mô tả danh mục', trigger: 'blur' },
    { max: 255, message: 'Mô tả không được vượt quá 255 ký tự', trigger: 'blur' }
  ]
})

const categoryFormRef = ref<FormInstance>()

const addCategory = () => {
  // Validate the new category form before adding
  const isValid = Object.values(form).every(value => value !== '' && value !== undefined);
  if (!isValid) {
    ElMessage.error('Please fill all the required fields');
    return;
  }

  // Create a new category object
  const newCategory: Category = {
    id: Date.now(), // Use a unique ID, such as a timestamp
    categoryCode: form.categoryCode,
    name: form.name,
    description: form.description,
    status: form.status ? '1' : '0',
  };

  // Add the new category to the category options
  categoryOptions.value.push(newCategory);

  // Add the new category to the ruleForm category list
  ruleForm.category.push(newCategory.id);

  // Clear the form for adding a new category
  form.categoryCode = '';
  form.name = '';
  form.description = '';
  form.status = false;

  // Close the category dialog
  dialogFormVisible.value = false;
}


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
    { required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' },
    { max: 100, message: 'Tên sản phẩm không được vượt quá 100 ký tự', trigger: 'blur' },
  ],
  price: [
    { required: true, message: 'Vui lòng nhập giá', trigger: 'blur' },
    { type: 'number', message: 'Giá phải là một số', trigger: ['blur', 'change'] },
  ],
  quantity: [
    { required: true, message: 'Vui lòng nhập số lượng', trigger: 'blur' },
    { type: 'number', message: 'Số lượng phải là một số', trigger: ['blur', 'change'] },
  ],
  category: [
    { type: 'array', required: true, message: 'Vui lòng chọn ít nhất một danh mục', trigger: 'change' }
  ],
  description: [
    { required: true, message: 'Vui lòng nhập mô tả', trigger: 'blur' },
    { max: 255, message: 'Mô tả không được vượt quá 255 ký tự', trigger: 'blur' }
  ]
});

const resetForm = (formEl: FormInstance | undefined) => {
  if (formEl) {
    formEl.resetFields()
    imagePreviews.value = [] // Xóa ảnh ở phần xem trước
    ruleForm.images = []
  }
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  fileInput?.click()
}

onMounted(() => {
  fetchCategoryOptions()
})
</script>


<style scoped>
.image-upload-container {
  text-align: center;
  margin-top: 20px;
}

.upload-placeholder {
  padding: 30px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.upload-placeholder .el-button {
  margin-top: 20px;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.image-item {
  position: relative;
  width: 100px; /* Bạn có thể thay đổi kích thước này nếu cần */
  height: 100px;
  box-sizing: border-box;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-button {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.text {
  margin-top: 20px;
  font-size: 14px;
}

.status-active {
  color: #00ff8e;
}

.status-inactive {
  color: #fc8484;
}
</style>