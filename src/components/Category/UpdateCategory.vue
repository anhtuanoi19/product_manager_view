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

      <!-- Preview old images -->
      <div class="old-images">
        <div v-for="(image, index) in oldImages" :key="index" class="image-preview">
          <img :src="getImageUrl(image)" alt="Old image" class="preview-image" />
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
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" />
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const form = ref({
  id: '',
  name: '',
  description: '',
  categoryCode: '',
  status: '',
});

// Lưu trữ URL của ảnh cũ
const oldImages = ref([]);

const props = defineProps({
  categoryId: {
    type: Number,
    required: true
  }
});

const getImageUrl = (imagePath) => {
  if (imagePath) {
    const fileName = imagePath.split('/').pop();
    return `http://localhost:8080/api/images/${fileName}`;
  }
  return '';
};

const route = useRoute();

onMounted(async () => {
  const id = props.categoryId;
  try {
    const response = await axios.get(`http://localhost:8080/api/category/findById/${id}`);
    form.value = response.data.result;

    console.log(response.data.result);
    // Giả sử URL của ảnh cũ nằm trong `imageUrls`
    oldImages.value = response.data.result.images || [];
  } catch (error) {
    console.error('Error fetching category:', error);
  }
});

const submitCategory = async () => {
  const formData = new FormData();

  const categoryData = {
    name: form.value.name,
    description: form.value.description,
    categoryCode: form.value.categoryCode,
    status: form.value.status,
  };

  formData.append('category', JSON.stringify(categoryData));
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput.files.length > 0) {
    formData.append('files', fileInput.files[0]);
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
