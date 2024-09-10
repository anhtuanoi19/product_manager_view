<template>
  <div class="container">
    <div class="left-side">
      <el-upload
        v-if="isEditMode"
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :file-list="fileList"
        :on-change="handleFileChange"
        :before-remove="beforeRemove"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Drag files here or click to upload</div>
      </el-upload>

      <!-- Preview old images -->
      <div class="old-images">
        <div v-for="image in oldImages" :key="image.id" class="image-preview">
          <img :src="getImageUrl(image.imagePath)" alt="Old image" class="preview-image" />
          <el-button v-if="isEditMode" @click="removeImage(image.id)" type="danger" size="mini">Xóa</el-button>
        </div>
      </div>

      <div class="text">
        <p><strong>Name:</strong> {{ form.name }}</p>
        <p><strong>Category Code:</strong> {{ form.categoryCode }}</p>
        <p><strong>Description:</strong> {{ form.description }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="form.status ? 'success' : 'danger'">
            {{ form.status ? 'Active' : 'Inactive' }}
          </span>
        </p>
      </div>
    </div>
    <div class="right-side">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="Category Code" prop="categoryCode">
          <el-input v-model="form.categoryCode" :disabled="true" />
        </el-form-item>
        <el-form-item label="Product Name" prop="name">
          <el-input v-model="form.name" :disabled="!isEditMode" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" :disabled="!isEditMode" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" :disabled="!isEditMode">
            <el-option label="Active" value="1" />
            <el-option label="Inactive" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button v-if="isEditMode" type="primary" @click="submitCategory">Submit</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

// Form state
const form = ref({
  id: '',
  name: '',
  description: '',
  categoryCode: '',
  status: '',
});

// Lưu trữ URL của ảnh cũ và ID ảnh
const oldImages = ref([]); // { id, imagePath }
const imagesIds = ref([]); // Danh sách ID của ảnh cũ

// Props
const props = defineProps({
  categoryId: {
    type: Number,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false // Default value
  }
});

// Validation rules
const rules = {
  name: [
    { required: true, message: 'Please input product name', trigger: 'blur' },
    { min: 3, max: 100, message: 'Product name must be between 3 and 100 characters', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Please input description', trigger: 'blur' },
    { min: 3, max: 100, message: 'Description must be between 3 and 100 characters', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Please select status', trigger: 'change' }
  ]
};

// Fetch category data
const getImageUrl = (imagePath) => {
  if (imagePath) {
    return `http://localhost:8080/api/images/${imagePath.split('/').pop()}`;
  }
  return '';
};

const route = useRoute();

onMounted(async () => {
  const id = props.categoryId;
  try {
    const response = await axios.get(`http://localhost:8080/api/category/findById/${id}`);
    const result = response.data.result;

    // Update form with fetched data
    form.value.id = result.id;
    form.value.categoryCode = result.categoryCode;
    form.value.name = result.name;
    form.value.description = result.description;
    form.value.status = result.status;

    // Update old images and imagesIds
    oldImages.value = result.images.map(img => ({ id: img.id, imagePath: img.imagePath })) || [];
    imagesIds.value = result.images.map(img => img.id) || [];
  } catch (error) {
    console.error('Error fetching category:', error);
  }
});

const formRef = ref(null);

// Handle form submission
const submitCategory = async () => {
  const formEl = formRef.value;
  if (!formEl) return;

  formEl.validate(async (valid) => {
    if (valid) {
      const formData = new FormData();

      const categoryData = {
        name: form.value.name,
        description: form.value.description,
        categoryCode: form.value.categoryCode,
        status: form.value.status,
        imgaesIds: imagesIds.value, // Thêm imagesIds vào dữ liệu gửi đi
        modifiedBy: 'admin',
        createdBy: 'admin'
      };

      formData.append('category', JSON.stringify(categoryData));

      // Xử lý ảnh tải lên
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append('images', fileInput.files[i]);
        }
      }

      try {
        await axios.put(`http://localhost:8080/api/category/update/${form.value.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Category updated successfully');
      } catch (error) {
        console.error('Error updating category:', error);
      }
    } else {
      console.error('Form validation failed');
    }
  });
};

// Xóa ảnh
const removeImage = (imageId) => {
  imagesIds.value = imagesIds.value.filter(id => id !== imageId); // Xóa ID ảnh
  oldImages.value = oldImages.value.filter(img => img.id !== imageId); // Xóa ảnh cũ
};
</script>

<style scoped>
.container {
  display: flex;
}

.left-side {
  flex: 1;
  padding: 20px;
}

.right-side {
  flex: 1;
  padding: 20px;
}

.upload-demo {
  width: 100%;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
}

.upload-demo i {
  font-size: 28px;
  color: #409EFF;
}

.upload-demo .el-upload__text {
  color: #999;
  font-size: 14px;
}

/* Preview old images */
.old-images {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
}

.image-preview {
  margin-right: 10px;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
}

.text {
  margin-top: 20px;
  font-size: 14px;
}
</style>
