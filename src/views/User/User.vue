<template>
  <div id="user">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域（阴影设置） -->
    <el-card shadow="never">
      <!-- layout布局 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 带按钮的输入框（输入框绑定query值） -->
          <el-input placeholder="请输入姓名查询" v-model="queryInfo.query" @input="changeInput" clearable @clear="clearInfo">
            <el-button slot="append" icon="el-icon-search" @click="queryInfoList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- table数据展示 -->
      <el-table :data="usersList" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <!-- 绑定时间戳 -->
        <!-- <el-table-column prop="create_time" label="创建日期" :formatter="dateFormat"></el-table-column> -->
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 通过作用域插槽定义状态和操作 -->
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <!-- switch 状态发生变化时的回调函数 -->
            <el-switch @change="switchChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column class="operation" label="操作" width="220px">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top-start" :enterable="false">
              <el-button type="primary" @click="altUser(scope.row.id)" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" @click="delUser(scope.row.id)" icon="el-icon-delete"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button @click="allotRoles(scope.row)" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>
    <!-- 对话框添加用户区域 -->
    <el-dialog @close="addDialogClose" title="添加用户" :visible.sync="addDialogVisible" width="30%">
      <el-form :model="addForm" :rules="addRules" ref="ruleForm" label-width="100px">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserData">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框修改用户区域 -->
    <el-dialog @close="altDialogClose" title="修改用户" :visible.sync="altDialogVisible" width="30%">
      <el-form :model="editForm" :rules="editRules" ref="altRuleForm" label-width="100px">
        <el-form-item label="用户名称" prop="username">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="altDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserData">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框分配角色区域 -->
    <el-dialog title="分配角色" :visible.sync="allotDialogVisible" @close="allotRolesClose" width="40%">
      <div>当前的用户：{{ allotUserInfo.username }}</div>
      <div>当前的角色：{{ allotUserInfo.role_name }}</div>
      <div>
        分配新角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
        </el-select>
      </div>
      <span slot="footer">
        <el-button @click="allotDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotUserRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUserData, changeState, addUserInfo, altUserInfo, submitEdit, delUserInfo, allotUser, getRolesData } from '@/network/users'
import moment from 'moment'
export default {
  name: 'user',
  data() {
    // 自定义校验规则
    let validateEmail = (addRules, value, callback) => {
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (regEmail.test(value)) return callback()
      callback(new Error('请输入有效的邮箱'))
    }
    let validateMobile = (addRules, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[3678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) return callback()
      callback(new Error('请输入有效的手机号码'))
    }
    return {
      // 分配角色数据
      allotUserInfo: {},
      selectedRoleId: '',
      rolesList: [],
      // 获取用户列表的参数
      queryInfo: {
        query: '',
        // 当前页
        pagenum: 1,
        // 页的容量
        pagesize: 10,
      },
      total: 0,
      // 用户列表数据
      usersList: [],
      // 是否展示添加、修改、删除、对话框，分配权限
      addDialogVisible: false,
      altDialogVisible: false,
      allotDialogVisible: false,
      // 表单校验，添加修改删除
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      editForm: {},
      addRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 5,
            max: 10,
            message: '长度在 5 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' },
        ],
      },
      editRules: {
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getUserData()
  },
  methods: {
    // 监听页容量的变化（新的参数，当前的页容量）
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserData()
    },
    // 当前页的改变（新的参数，当前页）
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserData()
    },
    // switch状态的修改
    async switchChange(state) {
      const switchBool = state.mg_state
      const uId = state.id
      // 发送网络请求修改状态
      const res = await changeState(uId, switchBool)
      if (res.meta.status !== 200) {
        this.state.mg_state = !this.state.mg_state
        this.$message.error('修改状态失败！')
      }
      this.$message.success('修改状态成功！')
    },
    // 点击搜索查询用户
    queryInfoList() {
      this.getUserData()
    },
    changeInput() {
      this.queryInfo.query === '' && this.getUserData()
    },
    // 输入框清除时，展示全部数据
    clearInfo() {
      this.getUserData()
    },
    // 展示添加用户
    addUser() {
      this.addDialogVisible = true
    },
    // 点击确定添加用户数据（先校验是否合法）
    addUserData() {
      this.$refs.ruleForm.validate(async (vaild) => {
        if (!vaild) return
        const res = await addUserInfo(this.addForm.username, this.addForm.password, this.addForm.email, this.addForm.mobile)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败！')
        this.$message.success('添加用户成功！')
        this.addDialogVisible = false
        this.getUserData()
      })
    },
    // 点击确定修改用户数据（先校验是否合法）
    editUserData() {
      this.$refs.altRuleForm.validate(async (vaild) => {
        if (!vaild) return
        // 参数为editForm查询时的参数
        const res = await submitEdit(this.editForm.id, this.editForm.email, this.editForm.mobile)
        if (res.meta.status !== 200) return this.$message.error('修改用户失败！')
        this.$message.success('修改用户成功！')
        this.altDialogVisible = false
        this.getUserData()
      })
    },
    // 关闭添加用户提示框（清除数据）
    addDialogClose() {
      this.$refs.ruleForm.resetFields()
    },
    altDialogClose() {
      this.$refs.altRuleForm.resetFields()
    },
    allotRolesClose() {
      this.selectedRoleId = ''
    },
    // 点击修改用户信息
    async altUser(id) {
      // 根据id发送请求修改数据
      this.altDialogVisible = true
      const res = await altUserInfo(id)
      // 将获取的数据绑定为editForm
      this.editForm = res.data
    },
    // 点击删除用户信息
    delUser(id) {
      // 根据id删除用户
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await delUserInfo(id)
          this.getUserData()
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
    // 时间戳转换
    dateFormat(row, column) {
      const date = row[column.property]
      if (date == undefined) {
        return ''
      }
      return moment(date * 1000).format('YYYY-MM-DD hh:mm:ss')
    },
    // 分配角色的事件
    async allotRoles(role) {
      // 获取当前用户和角色，当前用户id
      const { username, role_name, id } = role
      this.allotUserInfo = { username, role_name, id }

      // 获取角色列表的角色，赋值给分配新角色
      const res = await getRolesData()
      this.rolesList = res.data
      this.allotDialogVisible = true
    },
    async allotUserRoles() {
      // 获取角色id和用户id
      const id = this.allotUserInfo.id
      const rid = this.selectedRoleId
      if (!rid) return this.$message.warning('请选择新的角色！')
      const res = await allotUser(id, rid)
      if (res.meta.status == 400) return this.$message.warning('不允许修改admin账户！')
      this.allotDialogVisible = false
      this.$message.success('分配角色成功！')
      this.getUserData()
    },
    // 网络请求
    async getUserData() {
      const res = await getUserData(this.queryInfo.query, this.queryInfo.pagenum, this.queryInfo.pagesize)
      this.usersList = res.data.users
      this.total = res.data.total
    },
  },
}
</script>

<style lang='less' scoped>
.el-tooltip {
  margin-left: 8px;
}
.el-dialog div {
  margin-top: 10px;
}
</style>
