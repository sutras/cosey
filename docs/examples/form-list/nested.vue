<template>
  <co-form :model="formModel" label-width="80px" :submit="onSubmit">
    <co-form-list
      v-model="formModel.departments"
      prop="departments"
      label="部门"
      :rules="[{ type: 'array', required: true, message: '不能为空' }]"
    >
      <template #custom="{ list, getKey, getProp, add, remove, move }">
        <div class="flex flex-col gap-y-4">
          <co-dnd-sort @move="move">
            <co-transition-group effect="fade">
              <co-dnd-sort-item v-for="(row, index) in list" :key="getKey(row)" :index="index">
                <el-card shadow="never" class="relative">
                  <el-space direction="vertical" fill size="large">
                    <co-form-item
                      v-model="row.name"
                      :prop="getProp(index, 'name')"
                      label="部门名称"
                      width="md"
                      :rules="[{ required: true, message: '请输入部门名称' }]"
                    />
                    <co-form-list
                      v-model="row.employees"
                      :prop="getProp(index, 'employees')"
                      label="员工"
                      :rules="[
                        {
                          type: 'array',
                          required: true,
                          message: '不能为空',
                        },
                      ]"
                      draggable
                      v-slot="{ row, getProp }"
                    >
                      <co-form-item
                        v-model="row.num"
                        :prop="getProp('num')"
                        label="工号"
                        width="sm"
                        :rules="[{ required: true, message: '请输入工号' }]"
                      />
                      <co-form-item
                        v-model="row.name"
                        :prop="getProp('name')"
                        label="姓名"
                        width="sm"
                        :rules="[{ required: true, message: '请输入姓名' }]"
                      />
                    </co-form-list>
                  </el-space>
                  <el-button class="absolute end-3 top-3" link type="danger" @click="remove(index)">
                    <co-icon name="bi bi-trash3" size="lg" />
                  </el-button>
                </el-card>
              </co-dnd-sort-item>
            </co-transition-group>
          </co-dnd-sort>

          <el-button plain class="w-full" @click="() => add()">
            <co-icon name="bi bi-plus-lg" class="me-1" />
            新增
          </el-button>
        </div>
      </template>
    </co-form-list>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const formModel = reactive<{
  departments: {
    name: string;
    employees: {
      num: string;
      name: string;
    }[];
  }[];
}>({
  departments: [],
});

const onSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(formModel);
  ElMessage.success('提交成功');
};
</script>
