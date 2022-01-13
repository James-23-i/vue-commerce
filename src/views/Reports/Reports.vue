<template>
  <div id="reports">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域 -->
    <el-card shadow="never">
      <!-- echarts可视化数据 -->
      <div id="myChart" :style="{ width: '600px', height: '400px' }"></div>
    </el-card>
  </div>
</template>

<script>
import reports from '@/utils/reports'
import { getTotalData } from '@/network/reports'
export default {
  name: 'Reports',
  data() {
    return {
      totalData: {},
      reports: reports.options,
    }
  },
  mounted() {
    this.drawChart()
  },
  methods: {
    async drawChart() {
      // DOM元素
      let myEchart = this.$echarts.init(document.getElementById('myChart'))
      // 发送网络请求获取数据
      const res = await getTotalData()
      this.totalData = res.data
      // 合并echarts数据
      let option = Object.assign(this.reports, this.totalData)
      myEchart.setOption(option)
    },
  },
}
</script>

<style lang='less' scoped>
</style>
