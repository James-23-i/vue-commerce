<template>
  <div id="CateParams">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域 -->
    <el-card shadow="never">
      <el-alert title="注意：只允许为第三级分类设置相关参数" :closable="false" type="warning" show-icon></el-alert>
      <!-- 级联选择器 -->
      <div class="selectCate">
        选择商品分类：
        <el-cascader
          clearable
          v-model="selectKeys"
          :options="CascaderList"
          :props="{
            expandTrigger: 'hover',
            value: 'cat_id',
            label: 'cat_name',
            children: 'children',
            checkStrictly: true,
          }"
          @change="handleChange"
        ></el-cascader>
      </div>
      <!-- Tab标签 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="item in tabMapOptions" :key="item.name" :label="item.label" :name="item.name">
          <el-button size="mini" type="primary" :disabled="isDisabled" @click="addParams">{{ addType }}</el-button>
          <el-table border stripe :data="dataList" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 数据本身的标签 -->
                <el-tag
                  @close="handleClose(scope.row, index)"
                  :disable-transitions="false"
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                >
                  {{ item }}
                </el-tag>
                <!-- 需要添加的标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  ref="saveTagInput"
                  size="small"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" :label="textLabel"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" class="el-icon-edit" @click="editData(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" class="el-icon-delete" @click="deleteData(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数对话框 -->
      <el-dialog :title="'添加' + textTitle" :visible.sync="addDialogVisible" width="30%" @close="addDialogClose">
        <el-form :model="addForm" :rules="rulesForm" ref="addFormRef" label-width="100px">
          <el-form-item :label="textTitle" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParamsData">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑参数对话框 -->
      <el-dialog :title="'修改' + textTitle" :visible.sync="editDialogVisible" width="30%" @close="editDialogClose">
        <el-form :model="editForm" :rules="editRulesForm" ref="editFormRef" label-width="100px">
          <el-form-item :label="textTitle" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDataBtn">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { getCascaderData, getCateParams, addParams, queryParamsById, editParams, deleteParams } from '@/network/cateParams'
export default {
  name: 'CateParams',
  data() {
    return {
      // Tab切换的内容
      tabMapOptions: [
        { label: '动态参数', name: 'many' },
        { label: '静态属性', name: 'only' },
      ],
      addDialogVisible: false,
      editDialogVisible: false,

      paramsList: [],
      staticList: [],
      // Tab标签的默认选中
      activeName: 'many',
      // 级联数据
      CascaderList: [],
      selectKeys: [],
      // 级联分类数据的id
      cascaderId: '',
      // 属性id
      attr_id: '',
      // 表单数据
      addForm: {
        attr_name: '',
      },
      editForm: {},
      rulesForm: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
      },
      editRulesForm: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCascaderData()
  },
  computed: {
    addType() {
      if (this.activeName === 'many') {
        return '添加参数'
      } else {
        return '添加属性'
      }
    },
    dataList() {
      if (this.activeName === 'many') {
        return this.paramsList
      } else {
        return this.staticList
      }
    },
    textLabel() {
      if (this.activeName === 'many') {
        return '参数名称'
      } else {
        return '属性名称'
      }
    },
    // 判断是否禁用按钮
    isDisabled() {
      if (!this.selectKeys.length) {
        return true
      } else {
        return false
      }
    },
    // 添加参数对话框的标题
    textTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
  methods: {
    // Tab标签的点击
    handleClick() {
      // 根据点击不同的Tab标签，传递不同的请求参数 only / many
      // console.log(this.activeName);
      // 点击切换Tab也要发送请求
      this.getCateParams()
    },
    // 级联数据的变化
    handleChange() {
      // 当选中的数据长度等于三时，代表数据是三级的数据，则能进行选择（否则不能选择）
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.staticList = []
        this.paramsList = []
      }
      // 获取级联数据分类id
      this.cascaderId = this.selectKeys[this.selectKeys.length - 1]
      // 当选择级联数据后才发送网络请求
      this.getCateParams()
    },
    // 添加参数对话框
    addParams() {
      this.addDialogVisible = true
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 编辑参数对话框
    async editData(attr_id) {
      this.editDialogVisible = true
      this.attr_id = attr_id
      const res = await queryParamsById(this.cascaderId, this.attr_id, this.activeName)
      // 赋值给editForm
      this.editForm = res.data
    },
    editDataBtn() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const res = await editParams(this.cascaderId, this.attr_id, this.editForm.attr_name, this.activeName)
        this.getCateParams()
        this.$message.success('编辑参数成功！')
        this.editDialogVisible = false
      })
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除参数
    deleteData(attr_id) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await deleteParams(this.cascaderId, attr_id)
          this.getCateParams()
          this.$message.success('删除参数成功！')
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
    // 添加参数按钮
    addParamsData() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const res = await addParams(this.cascaderId, this.addForm.attr_name, this.activeName)
        this.getCateParams()
        this.addDialogVisible = false
        this.$message.success('添加参数成功！')
      })
    },
    // 获取自动焦点（并且展示input）
    showInput(row) {
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加tag
    async handleInputConfirm(row) {
      if (row.inputValue) {
        row.attr_vals.push(row.inputValue.trim())
      }
      row.inputVisible = false
      row.inputValue = ''
      // 添加到数据中（编辑提交参数）
      this.editParamsPut(row)
      this.$message.success('添加参数选项成功！')
    },
    // 删除标签
    handleClose(row, index) {
      row.attr_vals.splice(index, 1)
      this.editParamsPut(row)
      this.$message.success('删除参数选项成功！')
    },
    // 编辑提交参数选项
    async editParamsPut(row) {
      const res = await editParams(this.cascaderId, row.attr_id, row.attr_name, this.activeName, row.attr_vals.join(','))
    },
    // 网络请求接收数据
    async getCascaderData() {
      const res = await getCascaderData()
      this.CascaderList = res.data
    },
    async getCateParams() {
      const res = await getCateParams(this.cascaderId, this.activeName)
      // 注：必须将数据的整理和添加放在Tab数据切换之前（才能确保添加进去的属性发生刷新）
      // 获取参数下的可选项 attr_vals
      res.data.forEach((item) => {
        // 判断（当字符串不为空时，用字符串分割拼接成数组，为空时直接赋值空数组）
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 为不同的input添加不同的绑定数据和隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.paramsList = res.data
      } else {
        this.staticList = res.data
      }
    },
  },
}
</script>

<style lang='less' scoped>
.selectCate {
  margin-top: 20px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
