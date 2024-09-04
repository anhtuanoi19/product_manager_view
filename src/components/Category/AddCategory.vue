<template>
  <div class="container">
    <div class="left-side">
      <el-upload
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
          <el-select v-model="form.status">
            <el-option label="Active" value="1" />
            <el-option label="Inactive" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitCategory">Submit</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const form = ref({
  name: '',
  description: '',
  categoryCode: '',
  status: '',
});

const fileList = ref([]);

const rules = {
  name: [{ required: true, message: 'Please input product name', trigger: 'blur' }],
  description: [{ required: true, message: 'Please input description', trigger: 'blur' }],
  categoryCode: [{ required: true, message: 'Please input category code', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select status', trigger: 'change' }],
};

const handleFileChange = (file, fileList) => {
  fileList.value = fileList;
};

const beforeRemove = (file, fileList) => {
  return confirm(`Are you sure to remove ${file.name}?`);
};

const submitCategory = async () => {
  const formRef = $refs.formRef;
  formRef.validate(async (valid) => {
    if (valid) {
      const formData = new FormData();

      // Thay thế giá trị trong categoryData bằng dữ liệu thực tế của bạn
      const categoryData = {
        name: form.value.name,
        description: form.value.description,
        categoryCode: form.value.categoryCode,
        status: form.value.status,
      };

      // Chuyển đổi dữ liệu thành JSON và thêm vào FormData
      formData.append('category', JSON.stringify(categoryData));

      // Thay thế path_to_your_file bằng đường dẫn thực tế đến tệp tin
      if (fileList.value.length > 0) {
        fileList.value.forEach(file => {
          formData.append('files', file.raw);
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
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        ElMessage.error('Error creating category');
      }
    } else {
      ElMessage.error('Form validation failed');
    }
  });
}
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

.text {
  margin-top: 20px;
  font-size: 14px;
}
</style>
