<template>
  <div class="container">
    <div class="left-side">
      <div class="custom-file-upload">
        <input type="file" id="fileInput" multiple @change="handleFileChange" />
        <label for="fileInput">
          <i class="el-icon-upload"></i>
          <div class="upload-text">Drag files here or click to upload</div>
        </label>
      </div>
      <div v-if="fileList.length > 0" class="image-preview">
        <div v-for="(file, index) in fileList" :key="index" class="image-item">
          <img :src="file.preview" alt="preview" />
          <el-popconfirm
            title="Are you sure you want to remove this image?"
            @confirm="removeImage(index)"
            @cancel="handleCancel"
            placement="top"
          >
            <template #reference>
              <el-button type="danger" :icon="Delete" circle class="remove-icon"/>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <div class="text">
        <p><strong>Name:</strong> {{ form.name }}</p>
        <p><strong>Price:</strong> {{ form.categoryCode }}</p>
        <p><strong>Quantity:</strong> {{ form.description }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="form.status ? 'success' : 'danger'">
            {{ form.status ? ' Active' : ' Inactive' }}
          </span>
        </p>
      </div>
    </div>
    <div class="right-side">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="Product Name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="Category Code" prop="categoryCode">
          <el-input v-model="form.categoryCode" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="1">Active</el-radio>
            <el-radio label="0">Inactive</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-popconfirm
            title="Are you sure you want to submit this category?"
            @confirm="submitCategory"
            @cancel="handleCancelSubmit"
            placement="top"
          >
            <template #reference>
              <el-button type="primary">Submit</el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElButton, ElMessage, ElPopconfirm } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

const form = ref({
  name: '',
  description: '',
  categoryCode: '',
  status: '',
});

const fileList = ref([]);
const formRef = ref(null);

const rules = {
  name: [
    { required: true, message: 'Please input product name', trigger: 'blur' },
    { min: 3, max: 100, message: 'Product name must be between 3 and 100 characters', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Please input description', trigger: 'blur' },
    { min: 3, max: 100, message: 'Description must be between 3 and 100 characters', trigger: 'blur' }
  ],
  categoryCode: [
    { required: true, message: 'Please input category code', trigger: 'blur' },
    { min: 3, max: 100, message: 'Category code must be between 3 and 100 characters', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Please select status', trigger: 'change' }
  ]
};

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  fileList.value = files.map(file => {
    return {
      file,
      preview: URL.createObjectURL(file)
    };
  });
};

const removeImage = (index) => {
  fileList.value.splice(index, 1);
};

const handleCancel = () => {
  ElMessage.info('Removal canceled');
};

const handleCancelSubmit = () => {
  ElMessage.info('Submission canceled');
};

const submitCategory = async () => {
  const formRefValue = formRef.value;
  formRefValue.validate(async (valid) => {
    if (valid) {
      const formData = new FormData();

      const categoryData = {
        name: form.value.name,
        description: form.value.description,
        categoryCode: form.value.categoryCode,
        status: form.value.status,
      };

      formData.append('category', JSON.stringify(categoryData));

      if (fileList.value.length > 0) {
        fileList.value.forEach(file => {
          formData.append('files', file.file);
        });
      }

      try {
        const response = await axios.post('http://localhost:8080/api/category/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        ElMessage.success('Category created successfully');
        console.log('Response:', response.data);

        // Reset form and image preview
        form.value = {
          name: '',
          description: '',
          categoryCode: '',
          status: '',
        };
        fileList.value = [];
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        ElMessage.error('Error creating category');
      }
    } else {
      ElMessage.error('Form validation failed');
    }
  });
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
}

.left-side {
  flex: 1;
  padding: 20px;
}

.right-side {
  flex: 1;
  padding: 20px;
}

.custom-file-upload {
  position: relative;
  display: inline-block;
  width: 100%;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: background-color 0.3s;
}

.custom-file-upload:hover {
  background-color: #e0e0e0;
}

.custom-file-upload input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.custom-file-upload label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #409EFF;
}

.custom-file-upload .upload-text {
  color: #999;
  font-size: 14px;
  margin-top: 10px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.image-item {
  position: relative;
  width: calc(25% - 10px); /* 4 images per row, adjust based on gap */
  box-sizing: border-box;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.7);
  border-radius: 50%;
  color: white;
  padding: 5px;
  cursor: pointer;
}

.text p {
  margin: 10px 0;
}

.success {
  color: green;
}

.danger {
  color: red;
}
</style>
