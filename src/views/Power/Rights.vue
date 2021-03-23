<template>
  <div id="rights">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域（阴影设置） -->
    <el-card shadow="never">
      <el-table :data="rightsData" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 0">一级</el-tag>
            <el-tag v-else-if="scope.row.level == 1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  import { getRightsData } from '@/network/power'
  export default {
    name: 'Rights',
    data() {
      return {
        rightsData: []
      }
    },
    created() {
      this.getRightsData()
    },
    methods: {
      async getRightsData() {
        const res = await getRightsData()
        this.rightsData = res.data
      }
    },
  }
</script>

<style lang='scss' scoped>
</style>