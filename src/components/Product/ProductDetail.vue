
<template>
  <el-card v-if="product" class="product-detail-card">
    <el-row>
      <!-- Phần hình ảnh -->
      <el-col :span="12">
        <div v-if="isEditMode" class="image-upload-container">
          <input
            ref="fileInputRef"
            type="file"
            multiple
            @change="handleFileChange"
            style="display: none;"
          />
          <div class="image-upload-wrapper">
            <el-button type="primary" @click="triggerFileInput">
              Upload Images
            </el-button>
          </div>
        </div>
        <div v-if="!isEditMode" class="image-gallery">
          <div class="large-image-container">
            <img :src="getImageUrl(selectedImage)" alt="Large Product Image" class="large-image" />
          </div>
          <div class="thumbnail-gallery">
            <div v-for="image in product.images" :key="image.id" class="thumbnail-container">
              <img
                :src="getImageUrl(image.imagePath)"
                alt="Thumbnail"
                class="thumbnail-image"
                :class="{ active: image.imagePath === selectedImage }"
                @click="selectImage(image.imagePath)"
              />
            </div>
          </div>
        </div>
        <div v-if="isEditMode" class="image-grid">
          <div v-for="(image, index) in product.images" :key="'old-' + index" class="image-item">
            <img :src="getImageUrl(image.imagePath)" alt="Existing Image" />
            <el-button
              type="danger"
              class="remove-button"
              @click="removeOldImage(index)"
            >
              Remove
            </el-button>
          </div>
        </div>

        <div class="text" v-if="isEditMode">
          <p><strong>Name:</strong> {{ruleForm.name}}</p>
          <p><strong>Price:</strong> {{ruleForm.price}}</p>
          <p><strong>Category Name:</strong> {{ruleForm.productCode}}</p>
          <p><strong>Quantity:</strong>{{ruleForm.quantity}}</p>
          <p><strong>Description:</strong>{{ruleForm.description}}</p>
          <p>
            <strong>Status:</strong>
            <span :class="ruleForm.status ? 'status-active' : 'status-inactive'">
          {{ ruleForm.status ? ' Active' : ' Inactive' }}
          </span>
          </p>
        </div>
      </el-col>

      <!-- Phần thông tin sản phẩm -->
      <el-col :span="12">
        <el-form :model="product" label-width="120px" class="product-info-form" rules="rules" ref="formRef">
          <el-form-item label="Mã sản phẩm">
            <el-input v-model="product.productCode" disabled/>
          </el-form-item>
          <el-form-item label="Tên sản phẩm">
            <el-input v-model="product.name" :disabled="!isEditMode" />
          </el-form-item>
          <el-form-item label="Danh mục">
            <div v-if="!isEditMode">
              <div class="horizontal-tags">
                <div v-for="category in product.categories" :key="category.id" class="me-1">
                  <el-tag>{{ category.name || 'Danh mục không có tên' }}</el-tag>
                </div>
              </div>
            </div>
            <div v-else>
              <el-form-item>
                <el-select v-model="selectedCategories" multiple placeholder="Chọn danh mục"
                           style="width: 430px; margin-right: 20px"
                           collapse-tags
                           clearable
                           collapse-tags-tooltip
                           :max-collapse-tags="4"
                >
                  <el-option
                    v-for="category in allCategories"
                    :key="category.categoryCode"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
                <el-button type="primary" @click="openModal" class="ml-2">Thêm</el-button>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="Mô tả">
            <el-input type="textarea" v-model="product.description" :disabled="!isEditMode" />
          </el-form-item>
          <el-form-item label="Giá">
            <el-input v-model.number="product.price" type="number" :disabled="!isEditMode" />
          </el-form-item>
          <el-form-item label="Số lượng">
            <el-input v-model.number="product.quantity" type="number" :disabled="!isEditMode" />
          </el-form-item>
          <el-form-item label="Trạng thái">
            <el-select v-model="product.status" :disabled="!isEditMode">
              <el-option label="Hoạt động" value="1" />
              <el-option label="Ngừng hoạt động" value="0" />
            </el-select>
          </el-form-item>
          <el-button v-if="isEditMode" type="primary" @click="submitForm">Lưu sản phẩm</el-button>
        </el-form>
      </el-col>
    </el-row>

    <!-- Modal Thêm Danh Mục -->
    <el-dialog title="Thêm Danh Mục Mới" v-model="showCategoryModal">
      <el-form :model="newCategory" label-width="120px">
        <el-form-item label="Mã danh mục">
          <el-input v-model="newCategory.categoryCode" />
        </el-form-item>
        <el-form-item label="Tên danh mục">
          <el-input v-model="newCategory.name" />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input v-model="newCategory.description" />
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-select v-model="newCategory.status">
            <el-option label="Hoạt động" value="1" />
            <el-option label="Ngừng hoạt động" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="closeModal">Hủy</el-button>
        <el-button type="primary" @click="addNewCategory">Thêm</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import axios from 'axios'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'

const props = defineProps<{
  productId: number;
  isEditMode: boolean;
}>()

interface Category {
  id: number;
  name: string;
  description?: string;
  categoryCode: string;
  status: string;
}

const emits = defineEmits(['productUpdated'])

const product = ref<any>(null)
const selectedCategories = ref<number[]>([])
const allCategories = ref<Array<{
  id: number, name: string, status: string, description: string ,categoryCode: string }>>([])

const newImagePreviews = ref<string[]>([])
const selectedImage = ref<string>('')
const newCategory = ref({
  name: '',
  description: '',
  categoryCode: '',
  status: '1'
})
const showCategoryModal = ref(false)
const oldImages = ref([]); // { id, imagePath }
const imagesIds = ref([]); // Danh sách ID của ảnh cũ
const ruleForm = reactive<RuleForm>({
  name: '',
  price: 0,
  productCode: '',
  quantity: 0,
  listCategory: [],
  status: 0,
  description: '',
  images: [],
  categoryIds: selectedCategories.value
});
const listCategoryIds = ref<number[]>([])

const originalImagePaths = ref<string[]>([])
const originalImages = ref<string[]>([]) // Lưu trữ hình ảnh cũ
const fetchProductDetail = async () => {
  try {
    const { data } = await axios.get(`http://localhost:8080/api/product/findById/${props.productId}`)
    const result = data.result;
    product.value = data.result
    ruleForm.name = data.result.name
    ruleForm.price = data.result.price
    ruleForm.productCode = data.result.productCode
    ruleForm.quantity = data.result.quantity
    ruleForm.status = data.result.status
    ruleForm.description = data.result.description
    ruleForm.categoryIds = data.result.categoryIds
    ruleForm.listCategory = data.result.listCategory || [] // Initialize with existing categories

    selectedImage.value = product.value.images.length > 0 ? product.value.images[0].imagePath : ''

    if (props.isEditMode) {
      const categoryResponse = await axios.get('http://localhost:8080/api/category/findAll')
      allCategories.value = categoryResponse.data.result
      oldImages.value = product.value.images
      imagesIds.value = product.value.images.map((image: any) => image.id)

      // Hiển thị hình ảnh cũ
      newImagePreviews.value = product.value.images.map((image: any) => getImageUrl(image.imagePath))
      if (product.value) {
        selectedCategories.value = product.value.categories.map((category: Category) => category.id)
        listCategoryIds.value = allCategories.value.map(category => category.id)
        // Lưu trữ các đường dẫn hình ảnh cũ
        originalImagePaths.value = product.value.images.map((image: any) => image.imagePath)

        // Kết hợp hình ảnh cũ với hình ảnh mới (để giữ lại hình ảnh cũ)
        newImagePreviews.value = [
          ...product.value.images.map((image: any) => getImageUrl(image.imagePath))
        ]
      }
    }
  } catch (err) {
    console.error('Error fetching product details:', err)
  }
}
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    newImagePreviews.value = [
      ...newImagePreviews.value,
      ...Array.from(input.files).map(file => URL.createObjectURL(file))
    ]
  }
}

const removeNewImage = (index: number) => {
  newImagePreviews.value.splice(index, 1)
}

const removeOldImage = (index: number) => {
  if (product.value) {
    const imagePath = product.value.images[index].imagePath
    product.value.images.splice(index, 1)
    imagesIds.value = imagesIds.value.filter(id => id !== product.value.images[index].id)
    newImagePreviews.value = newImagePreviews.value.filter(image => image !== getImageUrl(imagePath))
  }
}



const getImageUrl = (imagePath: string | null) => {
  if (imagePath) {
    const fileName = imagePath.split('/').pop()
    return `http://localhost:8080/api/images/${fileName}`
  }
  return ''
}

const triggerFileInput = () => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  input.click()
}

const selectImage = (imagePath: string) => {
  selectedImage.value = imagePath
}

const closeModal = () => {
  showCategoryModal.value = false
}

const addNewCategory = () => {
  if (newCategory.value.name && newCategory.value.categoryCode) {
    // Tạo một ID tạm thời cho danh mục mới
    const tempId = Date.now();

    const newCategoryItem = {
      id: tempId, // Gán ID tạm thời
      name: newCategory.value.name,
      description: newCategory.value.description,
      categoryCode: newCategory.value.categoryCode,
      status: newCategory.value.status
    };

    // Thêm danh mục mới vào danh sách tất cả các danh mục
    allCategories.value.push(newCategoryItem);
    ruleForm.listCategory.push(newCategoryItem);

    // Chọn danh mục mới thêm vào dropdown danh sách danh mục đã chọn
    selectedCategories.value.push(tempId);

    // Đặt lại form để chuẩn bị thêm danh mục khác (nếu có)
    resetNewCategory();
    closeModal();
  } else {
    alert('Vui lòng nhập tên danh mục và mã danh mục.');
  }
};


const openModal = () => {
  showCategoryModal.value = true
}

const resetNewCategory = () => {
  newCategory.value = {
    name: '',
    description: '',
    categoryCode: '',
    status: '1'
  }
}

const PRODUCT_URL = 'http://localhost:8080/api/product'


interface RuleForm {
  name: string
  price: number
  quantity: number
  productCode: string
  categoryIds: number[]
  status: number
  description: string
  listCategory: any[] // Ensure this is an array
  images: File[]
}


const formRef = ref<FormInstance | null>(null)


const submitForm = async () => {
  const formData = new FormData();

  // Ensure ruleForm.listCategory is an array
  const listCategory = Array.isArray(ruleForm.listCategory) ? ruleForm.listCategory : [];

  // Danh sách ID của các danh mục đã chọn từ dropdown
  const existingCategoryIds = selectedCategories.value;

  // Lọc ra các danh mục mới (có ID tạm thời) để gửi kèm
  const newCategories = allCategories.value.filter(category =>
    category.id < 0 // ID tạm thời sẽ nhỏ hơn 0
  ).map(category => ({
    name: category.name,
    categoryCode: category.categoryCode,
    description: category.description,
    status: category.status,
  }));

  // Cập nhật danh sách danh mục cho sản phẩm
  ruleForm.listCategory = [
    ...listCategory,
    ...newCategories // Thêm danh mục mới vào listCategory
  ];

  const validCategoryIds = ruleForm.categoryIds.filter(id => listCategoryIds.value.includes(id));
  ruleForm.categoryIds = validCategoryIds;


  // Thêm chi tiết sản phẩm và danh mục vào FormData
  formData.append('product', JSON.stringify({
    id: props.productId,
    name: ruleForm.name,
    description: ruleForm.description,
    productCode: ruleForm.productCode,
    price: ruleForm.price,
    imagesIds: imagesIds.value,
    quantity: ruleForm.quantity,
    status: ruleForm.status,
    categoryIds: ruleForm.categoryIds, // Chỉ bao gồm ID của các danh mục hợp lệ
    listCategory: ruleForm.listCategory // Danh sách các danh mục mới và cũ
  }));

  // Xử lý upload hình ảnh
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput && fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
      formData.append('images', fileInput.files[i]);
    }
  }

  try {
    // Gửi yêu cầu PUT để cập nhật sản phẩm
    await axios.put(`http://localhost:8080/api/product/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    ElNotification({
      title: 'Success',
      message: 'Product updated successfully',
      type: 'success'
    });

    // Gửi sự kiện để thông báo sản phẩm đã được cập nhật
    emits('productUpdated');
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: 'Failed to update product',
      type: 'error'
    });
  }
};



const blobURLtoFile = async (blobURL: string, filename: string): Promise<File> => {
  try {
    const response = await fetch(blobURL);
    const blob = await response.blob();
    const mime = blob.type;
    return new File([blob], filename, { type: mime });
  } catch (error) {
    console.error('Error fetching blob:', error);
    throw error;
  }
};

// Convert data URL to File
const dataURLtoFile = (dataURL: string, filename: string): File => {
  const [header, base64Data] = dataURL.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URL: MIME type could not be extracted');
  }
  const mime = mimeMatch[1];
  const binary = atob(base64Data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], filename, { type: mime });
};


const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' },
    { max: 100, message: 'Tên sản phẩm không được vượt quá 100 ký tự', trigger: 'blur' },
    { min: 3, message: 'Tên phải có từ 3 ký tự', trigger: 'blur' }

  ],
  price: [
    { required: true, message: 'Vui lòng nhập giá', trigger: 'blur' },
    { type: 'number', message: 'Giá phải là một số', trigger: ['blur', 'change'] },
  ],
  quantity: [
    { required: true, message: 'Vui lòng nhập số lượng', trigger: 'blur' },
    { type: 'number', message: 'Số lượng phải là một số', trigger: ['blur', 'change'] },
  ],
  categoryIds: [
    { type: 'array', required: true, message: 'Vui lòng chọn ít nhất một danh mục', trigger: 'change' }
  ],
  description: [
    { required: true, message: 'Vui lòng nhập mô tả', trigger: 'blur' },
    { min: 3, max: 255, message: 'Mô tả không được vượt quá 255 ký tự', trigger: 'blur' }
  ]
});

watch(selectedCategories, (newVal) => {
  ruleForm.categoryIds = newVal
})
const resetForm = (formEl: FormInstance | undefined) => {
  if (formEl) {
    formEl.resetFields()
    ruleForm.images = []
  }
}

onMounted(fetchProductDetail)
</script>

<style scoped>
.large-image-container {
  position: relative;
  text-align: center;
}

.image-upload-wrapper {
  margin-bottom: 15px;
  text-align: center;
}

.large-image-container {
  position: relative;
  text-align: center;
}

.large-image {
  max-width: 90%;
  height: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.thumbnail-gallery {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.thumbnail-container {
  margin: 0 5px;
}

.thumbnail-image {
  width: 80px;
  height: 80px;
  cursor: pointer;
  border: 2px solid transparent;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.thumbnail-image.active {
  border-color: #409EFF;
}

.image-upload-container {
  margin-top: 20px;
}

.upload-placeholder {
  text-align: center;
  padding: 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.image-item {
  position: relative;
}

.image-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.remove-button {
  position: absolute;
  bottom: 0;
  right: 0;
}
.horizontal-tags {
  display: flex;
  flex-wrap: wrap; /* Allows tags to wrap to the next line if they overflow */
  gap: 8px; /* Adjust the spacing between tags */
}

.horizontal-tags .el-tag {
  margin: 0; /* Ensure tags do not have extra margin */
}

</style>