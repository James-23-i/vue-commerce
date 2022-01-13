<template>
  <div id="goodsList">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域 -->
    <el-card shadow="never">
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 输入框绑定请求的query值 -->
          <el-input placeholder="请输入内容" clearable @input="changeInput" v-model="queryGoodsList.query" @clear="clearGoods">
            <el-button slot="append" icon="el-icon-search" @click="queryGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
        <el-col :span="4">
          <download-excel-json class="btn btn-default" :data="goodsListFilterTime" :fields="json_fields" name="商品数据.xls">
            <el-button type="primary">导出1</el-button>
          </download-excel-json>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="exportExcelData">导出2</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="goodsList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column show-overflow-tooltip prop="goods_name" label="商品名称" width="700px"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" :formatter="dateFormat"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editGoods(scope.row.goods_id)"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="delGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryGoodsList.pagenum"
        :page-sizes="[15, 30, 45, 60]"
        :page-size="queryGoodsList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 编辑商品对话框 -->
    <el-dialog title="修改商品" :visible.sync="editDialogVisible" width="30%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getGoodsList, queryGoodsById, editGoodsById, deleteGoods } from '@/network/goods'
import exportExcel from '../../utils/exportExcel'
import moment from 'moment'
export default {
  name: 'GoodsList',
  data() {
    // 自定义数字输入框校验规则
    const validPrice = (rule, value, callback) => {
      let reg = /^[1-9]\d*$/
      if (value === '') {
        callback(new Error('请输入商品价格'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正整数'))
      } else {
        callback()
      }
    }
    const validWeight = (rule, value, callback) => {
      let reg = /^[1-9]\d*$/
      if (value === '') {
        callback(new Error('请输入商品重量'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正整数'))
      } else {
        callback()
      }
    }
    return {
      // 请求商品列表数据
      queryGoodsList: {
        query: '',
        pagenum: 1,
        pagesize: 15,
      },
      goodsList: [],
      // excel
      json_fields: {
        商品名称: 'goods_name',
        商品价格: 'goods_price',
        商品重量: 'goods_weight',
        创建时间: 'add_time',
      },
      tHeader: [
        {
          title: '商品名称',
          key: 'goods_name'
        },
        {
          title: '商品价格',
          key: 'goods_price'
        },
        {
          title: '商品重量',
          key: 'goods_weight'
        },
        {
          title: '创建时间',
          key: 'add_time'
        }
      ],
      total: 0,
      goods_id: '',
      editForm: {},
      editDialogVisible: false,
      editRules: {
        goods_price: [{ required: true, validator: validPrice, trigger: 'blur' }],
        goods_weight: [{ required: true, validator: validWeight, trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getGoodsList()
  },
  computed: {
    // 导出Excel时间戳的转换
    goodsListFilterTime() {
      return this.goodsList.map(item => {
        return {
          ...item,
          add_time: moment(item.add_time * 1000).format('YYYY-MM-DD')
        }
      })
    }
  },
  methods: {
    //导出Excel
    exportExcelData() {
          debugger
      exportExcel(this.tHeader, this.goodsListFilterTime, '商品数据')
    },
    // 查询商品和清除查询
    queryGoods() {
      this.getGoodsList()
    },
    clearGoods() {
      this.getGoodsList()
    },
    changeInput() {
      this.queryGoodsList.query === '' && this.getGoodsList()
    },
    // 添加商品
    addGoods() {
      this.$router.push('/goods/addGoods')
    },
    // 编辑商品
    async editGoods(id) {
      this.goods_id = id
      this.editDialogVisible = true
      const res = await queryGoodsById(id)
      this.editForm = res.data
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    editGoodsBtn() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const res = await editGoodsById(this.goods_id, this.editForm)
        this.$message.success('编辑商品成功！')
        this.editDialogVisible = false
        this.getGoodsList()
      })
    },
    // 删除商品
    delGoods(goods_id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await deleteGoods(goods_id)
          this.getGoodsList()
          this.$message.success('删除商品成功！')
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 分页
    handleSizeChange(newSize) {
      this.queryGoodsList.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryGoodsList.pagenum = newPage
      this.getGoodsList()
    },
    // 时间戳转换
    dateFormat(row, column) {
      var date = row[column.property]
      if (date == undefined) {
        return ''
      }
      return moment(date * 1000).format('YYYY-MM-DD')
    },
    async getGoodsList() {
      const res = await getGoodsList(this.queryGoodsList.query, this.queryGoodsList.pagenum, this.queryGoodsList.pagesize)
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
    },
  },
}
</script>

<style lang='less' scoped>
</style>
