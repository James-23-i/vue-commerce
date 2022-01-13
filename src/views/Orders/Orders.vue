<template>
  <div id="orders">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域 -->
    <el-card shadow="never">
      <el-row>
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryOrders.query" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="ordersList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="600px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" :formatter="dateFormat" width="200px"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改地址" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editAddress"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="物流信息" placement="top">
              <el-button size="mini" type="success" @click="searchLocalInfo">
                <i class="iconfont icon-shouhuodizhi"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryOrders.pagenum"
        :page-sizes="[10, 20, 30]"
        :page-size="queryOrders.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 对话框 -->
    <el-dialog title="修改地址" :visible.sync="editAddrDialogVisible" width="40%" @close="editAddrDialogClose">
      <el-form :model="addrForm" :rules="addrRules" ref="addrFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            style="width: 100%"
            clearable
            v-model="addrForm.address"
            :options="cityData"
            :props="{ expandTrigger: 'hover', value: 'value', label: 'label', children: 'children' }"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="addrForm.detailAddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editAddrDialogVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="物流信息" :visible.sync="localDialogVisible" width="40%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in timeLine" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import { queryOrdersData } from '@/network/orders'
import moment from 'moment'
import cityData from '@/utils/citydata'
import timeLine from '@/utils/timeline'
export default {
  name: 'Orders',
  data() {
    return {
      queryOrders: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      ordersList: [],
      total: 0,
      localDialogVisible: false,
      editAddrDialogVisible: false,
      // 联动数据
      cityData,
      selectKeys: [],
      addrForm: {
        address: [],
        detailAddress: '',
      },
      addrRules: {
        address: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
      },
      // 物流数据
      timeLine: timeLine.data,
    }
  },
  created() {
    this.queryOrdersData()
  },
  methods: {
    // 分页
    handleSizeChange(newSize) {
      this.queryOrders.pagesize = newSize
      this.queryOrdersData()
    },
    handleCurrentChange(newPage) {
      this.queryOrders.pagenum = newPage
      this.queryOrdersData()
    },
    // 级联数据
    handleChange() {
      console.log(this.addrForm.address)
    },
    editAddrDialogClose() {
      this.$refs.addrFormRef.resetFields()
    },
    // 查看物流信息
    searchLocalInfo() {
      this.localDialogVisible = true
    },
    // 修改地址
    editAddress() {
      this.editAddrDialogVisible = true
    },
    // 时间戳转换
    dateFormat(row, column) {
      var date = row[column.property]
      if (date == undefined) {
        return ''
      }
      return moment(date * 1000).format('YYYY-MM-DD HH:mm:ss')
    },
    async queryOrdersData() {
      const res = await queryOrdersData(this.queryOrders)
      console.log(res)
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
  },
}
</script>

<style lang='less' scoped>
.iconfont {
  font-size: 12px;
}
</style>
