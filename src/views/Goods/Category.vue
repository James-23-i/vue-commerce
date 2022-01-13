<template>
  <div id="category">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域（阴影设置） -->
    <el-card shadow="never">
      <el-button type="primary" @click="addCategory">添加分类</el-button>
      <!-- table数据展示 -->
      <tree-table
        class="tree-table"
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 用 template自定义表格数据 -->
        <template slot="isOk" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            style="color: green"
            class="el-icon-success"
          ></i>
          <i v-else style="color: red" class="el-icon-close"></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="operation" slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="editCateData(scope.row.cat_id)"
            icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="small" type="danger" @click="deleteCateData(scope.row.cat_id)" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="categories.pagenum"
        :page-size="categories.pagesize"
        :page-sizes="[5, 10, 15, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类弹窗 -->
    <el-dialog
      title="添加分类"
      :visible.sync="cateDialogVisible"
      width="40%"
      @close="cateDialogClose"
    >
      <el-form :model="addRuleForm" :rules="addRules" ref="addRuleFormRef" label-width="100px">
        <!-- 当只有添加分类的名称时，代表添加一级商品 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addRuleForm.cat_name"></el-input>
        </el-form-item>
        <!-- 当选择了级联选择器商品，代表在哪个层级下添加商品 -->
        <el-form-item label="父级分类">
          <!--
            v-model绑定选中级联的id，
            options可选项数据源，
            props配置选项，
            @change监听级联框中选中数据的ID（selectkeys）
          -->
          <el-cascader
            class="el-cascader"
            clearable
            v-model="selectKeys"
            :options="farListData"
            :props="{
              checkStrictly: true,
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类弹窗 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="30%">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategories">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCategoryData,
  addCategories,
  queryCateId,
  editCateById,
  deleteCateById,
} from '@/network/category'
export default {
  name: 'Category',
  data() {
    return {
      // 表格数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        // 使用 template
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk',
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort',
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation',
          width: '185px',
        },
      ],
      categories: {
        // type为3代表获取三层（所有）数据
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 表单校验
      addRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
      },
      editRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
      },
      // 添加分类数据
      addRuleForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0,
      },
      // 编辑分类数据
      editForm: {},
      editId: '',
      // 级联数据
      farListData: [],
      selectKeys: [],
      total: 0,
      categoryList: [],
      cateDialogVisible: false,
      editDialogVisible: false,
    }
  },
  created() {
    this.getCategoryData()
  },
  methods: {
    // 分页功能
    handleSizeChange(newSize) {
      this.categories.pagesize = newSize
      this.getCategoryData()
    },
    handleCurrentChange(newPage) {
      this.categories.pagenum = newPage
      this.getCategoryData()
    },
    // 对话框的关闭
    cateDialogClose() {
      this.$refs.addRuleFormRef.resetFields()
      this.addRuleForm.cat_level = 0
      this.addRuleForm.cat_pid = 0
      this.selectKeys = []
    },
    // 添加分类
    addCategory() {
      this.cateDialogVisible = true
      this.getFarListData()
    },
    // 监听级联框中选中数据的id
    handleChange() {
      // console.log(this.selectKeys);
      /*
        修改添加分类中的数据
        当selectkeys.length = 0，说明没有选中父级分类数据，添加一级数据
        当selectkeys.length > 0，（且长度和级联的等级一致，父级分类ID为最后一个元素的ID）说明选中父级分类数据，添加在选中层级下的数据
      */
      if (this.selectKeys.length > 0) {
        this.addRuleForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addRuleForm.cat_level = this.selectKeys.length
      } else {
        this.addRuleForm.cat_level = 0
        this.addRuleForm.cat_pid = 0
      }
    },
    // 添加分类渲染页面
    addCate() {
      // console.log(this.addRuleForm.cat_level, this.addRuleForm.cat_pid, this.addRuleForm.cat_name);
      this.$refs.addRuleFormRef.validate(async (vaild) => {
        if (!vaild) return
        const res = await addCategories(
          this.addRuleForm.cat_pid,
          this.addRuleForm.cat_name,
          this.addRuleForm.cat_level
        )
        this.getCategoryData()
        this.cateDialogVisible = false
        this.$message.success('添加分类成功！')
      })
    },
    // 编辑分类
    async editCateData(id) {
      this.editId = id
      this.editDialogVisible = true
      const res = await queryCateId(id)
      // 赋值给编辑数据editForm
      this.editForm = res.data
    },
    editCategories() {
      this.$refs.editFormRef.validate(async (vaild) => {
        if (!vaild) return
        const res = await editCateById(this.editId, this.editForm.cat_name)
        this.editDialogVisible = false
        this.$message.success('编辑分类成功！')
        this.getCategoryData()
      })
    },
    // 删除分类
    deleteCateData(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then( async () => {
          const res = await deleteCateById(id)
          this.getCategoryData()
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
    // 发送网络请求分类商品数据
    async getCategoryData() {
      const res = await getCategoryData(
        this.categories.type,
        this.categories.pagenum,
        this.categories.pagesize
      )
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    async getFarListData() {
      // type为2代表获取前两层数据
      const res = await getCategoryData(2)
      this.farListData = res.data
    },
  },
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 20px;
}

.el-cascader {
  width: 100%;
}
</style>
