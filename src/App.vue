<script setup lang="ts">
import AdminView from '@/components/admin/AdminView.vue'
import {ref} from "vue";
import vi from 'element-plus/es/locale/lang/vi'
import en from 'element-plus/es/locale/lang/en'
import {CirclePlusFilled} from '@element-plus/icons-vue'

const currentLocale = ref(vi)
const selectedLanguage = ref('vi')
const changeLanguage = (locale: any) => {
  if (locale === 'vi') {
    currentLocale.value = vi
  } else if (locale === 'en') {
    currentLocale.value = en
  }
}

</script>

<template>
  <el-config-provider :locale="currentLocale">
      <div id="i18n">
        <el-select id="i18n-select"
                   v-model="selectedLanguage"
                   placeholder="Select Language"
                   size="small"
                   style="width: 240px"
                   @change="changeLanguage"
                   :suffix-icon="CirclePlusFilled"
        >
          <el-option
            :label="'Tiếng Việt'"
            :value="'vi'"
          />
          <el-option
            :label="'English'"
            :value="'en'"
          />
        </el-select>
      </div>
        <div class="app-container">
      <AdminView />
    </div>
  </el-config-provider>
</template>

<style>
.app-container{
  font-family: 'Open Sans', sans-serif;
}
#i18n {
  position: absolute;
  top: 3px;
  right: 20px;

}

#i18n-select {
  border-radius: 50%;

}

</style>
