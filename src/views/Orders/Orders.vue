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
            <el-button slot="append" icon="el-icon-search" @click="queryInfoList"></el-button>
          </el-input>
        </el-col>
        <!-- <el-col :span="4">
          <el-button type="primary" @click="addOrder">创建订单</el-button>
        </el-col> -->
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="ordersList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="600px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="consignee_addr" label="订单地址"></el-table-column>
        <el-table-column label="订单支付">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '0'" type="danger">未支付</el-tag>
            <el-tag v-else-if="scope.row.order_pay === '1'" type="waring">支付宝</el-tag>
            <el-tag v-else-if="scope.row.order_pay === '2'" type="success">微信</el-tag>
            <el-tag v-else-if="scope.row.order_pay === '3'" type="info">银行卡</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_fapiao_company" label="公司名称"></el-table-column>
        <el-table-column prop="order_fapiao_content" label="发票内容"></el-table-column>
        <el-table-column prop="order_fapiao_title" label="发票标题"></el-table-column>
        <el-table-column label="是否发货">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_send === '否'" type="danger">未发货</el-tag>
            <el-tag v-else type="success">已发货</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="is_send" label="是否发货"></el-table-column> -->
        <!-- <el-table-column prop="create_time" label="下单时间" :formatter="dateFormat" width="200px"></el-table-column> -->
        <el-table-column label="操作" width="70px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑订单" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editOrder(scope.row.order_id)"></el-button>
            </el-tooltip>
            <!-- <el-tooltip effect="dark" content="物流信息" placement="top">
              <el-button size="mini" type="success" @click="searchLocalInfo">
                <i class="iconfont icon-shouhuodizhi"></i>
              </el-button>
            </el-tooltip> -->
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
        <el-form-item label="订单地址" prop="consignee_addr">
          <el-cascader
            style="width: 100%"
            clearable
            v-model="addrForm.consignee_addr"
            :options="cityData"
            :props="{ expandTrigger: 'hover', value: 'value', label: 'label', children: 'children' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="用户ID" prop="user_id">
          <el-input-number v-model="addrForm.user_id"></el-input-number>
        </el-form-item>
        <el-form-item label="订单编号" prop="order_number">
          <el-input disabled v-model="addrForm.order_number"></el-input>
        </el-form-item>
        <el-form-item label="订单价格" prop="order_price">
          <el-input-number v-model="addrForm.order_price"></el-input-number>
        </el-form-item>
        <el-form-item label="订单支付" prop="order_pay">
          <el-select v-model="order_pay" placeholder="请选择">
            <el-option v-for="item in payOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否发货" prop="is_send">
          <el-select v-model="is_send" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editAddrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrders">确 定</el-button>
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
import { queryOrdersData, addOrdersData, editOrdersData, detailOrdersData } from '@/network/orders'
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
      is_send: 0,
      order_pay: '0',
      options: [
        {
          value: 0,
          label: '未发货',
        },
        {
          value: 1,
          label: '已发货',
        },
      ],
      payOptions: [
        {
          value: '0',
          label: '未支付',
        },
        {
          value: '1',
          label: '支付宝',
        },
        {
          value: '2',
          label: '微信',
        },
        {
          value: '3',
          label: '银行卡',
        },
      ],
      ordersList: [],
      total: 0,
      localDialogVisible: false,
      editAddrDialogVisible: false,
      // 联动数据
      cityData,
      selectKeys: [],
      addrForm: {
        user_id: '',
        order_number: '',
        order_price: '',
        consignee_addr: '', // 字符串
        order_pay: '',
        pay_status: '',
        is_send: '',
      },
      addrRules: {
        consignee_addr: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        // detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
      },
      // 物流数据
      timeLine: timeLine.data,
      editId: '',
    }
  },
  created() {
    this.queryOrdersData()
  },
  methods: {
    // 查询
    queryInfoList() {
      this.queryOrdersData()
    },
    // 分页
    handleSizeChange(newSize) {
      this.queryOrders.pagesize = newSize
      this.queryOrdersData()
    },
    handleCurrentChange(newPage) {
      this.queryOrders.pagenum = newPage
      this.queryOrdersData()
    },
    editAddrDialogClose() {
      this.$refs.addrFormRef.resetFields()
    },
    // 查看物流信息
    searchLocalInfo() {
      this.localDialogVisible = true
    },
    // 修改地订单
    async editOrder(id) {
      const res = await detailOrdersData(id)
      this.addrForm.pay_status = res.data.pay_status
      this.addrForm.order_number = res.data.order_number
      this.addrForm.consignee_addr = res.data.consignee_addr
      this.addrForm.order_price = res.data.order_price
      this.addrForm.user_id = res.data.user_id
      this.addrForm.order_pay = res.data.order_pay
      this.editId = id
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
    async addOrders() {
      const res = await editOrdersData(this.editId, {
        ...this.addrForm,
        is_send: this.is_send,
        order_pay :this.order_pay,
        consignee_addr: this.addrForm.consignee_addr && this.addrForm.consignee_addr.map((item) => item).join(''),
      })
      if (res) {
        this.editAddrDialogVisible = false
        this.queryOrdersData()
      }
    },
  },
}
</script>

<style lang='less' scoped>
.iconfont {
  font-size: 12px;
}
</style>
