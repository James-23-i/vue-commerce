<template>
  <div id="roles">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card区域（阴影设置） -->
    <el-card shadow="never">
      <el-button type="primary" @click="addRolesBtn">添加角色</el-button>
      <!-- 使用树形数据必须绑定row-key -->
      <el-table :data="rolesData" style="width: 100%" stripe border>
        <el-table-column type="expand">
          <!-- 展开列用作用域插槽实现 -->
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-row
              class="boTop vcenter"
              :class="index1 === scope.row.children.length - 1 ? 'boBottom' : ''"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="19">
                <el-row :class="index2 === 0 ? '' : 'boTop'" class="vcenter" v-for="(item2, index2) in item1.children" :key="item2.id">
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag type="success" closable>{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <!-- 删除权限，角色（当前的角色），权限ID（当前的权限的id） -->
                    <el-tag type="warning" v-for="(item3, index3) in item2.children" :key="item3.id" closable @close="closeTag(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="285px">
          <template slot-scope="scope">
            <el-button @click="editRolesBtn(scope.row.id)" size="small" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="small" @click="delRoles(scope.row.id)" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button @click="allotBtn(scope.row)" size="small" type="warning" icon="el-icon-setting">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色弹窗 -->
    <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" width="30%" @close="closeAddRoles">
      <el-form :model="addRoles" :rules="addRules" ref="rolesForm" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色弹窗 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesDialogVisible" width="30%" @close="closeEditRoles">
      <el-form :model="editRoles" :rules="editRules" ref="editRolesForm" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="roleDialogVisible" width="30%">
      <el-tree
        :data="treeRoleDatas"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
        ref="rightsTree"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="alloTreeRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getRolesData, addRolesData, editInputData, editRolesData, delRolesData, delRights, getTreeRights, alloRights } from '@/network/power'
export default {
  name: 'Roles',
  data() {
    return {
      // 当前角色的id
      RoleId: '',
      rolesData: [],
      // 树形数据
      treeRoleDatas: [],
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      // 默认三级权限选中状态的数组
      defKeys: [],
      // 添加、编辑角色; 分配权限对话框状态
      addRolesDialogVisible: false,
      editRolesDialogVisible: false,
      roleDialogVisible: false,
      // 校验添加角色
      addRoles: {
        roleName: '',
        roleDesc: '',
      },
      editRoles: {},
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'blur' },
        ],
      },
      editRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getRolesData()
  },
  computed: {
    getRowKey(row) {
      return row.id
    },
  },
  methods: {
    // 弹窗添加角色
    addRolesBtn() {
      this.addRolesDialogVisible = true
    },
    // 编辑角色（先获取id，发送请求，赋值输入框）
    async editRolesBtn(id) {
      const res = await editInputData(id)
      // 赋值输入框的内容
      this.editRoles = res.data
      this.editRolesDialogVisible = true
    },
    // 分配权限对话框
    async allotBtn(role) {
      // 获取当前角色的id，作为data数据值
      this.RoleId = role.id
      // 在展开对话框之前获取分配权限的树形数据
      const res = await getTreeRights()
      this.treeRoleDatas = res.data
      // 默认勾选三级权限（在调用之前先清空数组，避免重复）
      this.defKeys = []
      this.getDefKeys(role, this.defKeys)
      this.roleDialogVisible = true
    },
    // 分配权限
    async alloTreeRoles() {
      // 获取tree上勾选和半勾选的菜单
      const keys = [...this.$refs.rightsTree.getCheckedKeys(), ...this.$refs.rightsTree.getHalfCheckedKeys()]
      let keyStr = keys.join(',')
      const res = await alloRights(this.RoleId, keyStr)
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.roleDialogVisible = false
      this.getRolesData()
    },
    // 关闭弹窗重置数据
    closeAddRoles() {
      this.$refs.rolesForm.resetFields()
    },
    closeEditRoles() {
      this.$refs.editRolesForm.resetFields()
    },
    // 点击确定先校验是否合法再发送网络请求添加、编辑角色
    addUserRoles() {
      this.$refs.rolesForm.validate(async (vaild) => {
        if (!vaild) return
        const res = await addRolesData(this.addRoles.roleName, this.addRoles.roleDesc)
        this.addRolesDialogVisible = false
        this.getRolesData()
        this.$message.success('添加角色成功！')
      })
    },
    // 编辑数据
    editUserRoles() {
      this.$refs.editRolesForm.validate(async (vaild) => {
        if (!vaild) return
        const res = await editRolesData(this.editRoles.roleId, this.editRoles.roleName, this.editRoles.roleDesc)
        this.$message.success('编辑角色成功！')
        this.editRolesDialogVisible = false
        this.getRolesData()
      })
    },
    // 删除角色
    delRoles(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await delRolesData(id)
          this.getRolesData()
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
    // 删除权限
    closeTag(role, rightId) {
      // console.log(role, rightId);
      const roleId = role.id
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await delRights(roleId, rightId)
          // 当删除权限时，调用getRoleData会重新刷新渲染全部的数据，会对刷新的数据进行折叠
          // this.getRolesData()
          // 刷新分级权限下的数据
          role.children = res.data
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
    // 通过递归的方式，获取三级权限的数据
    getDefKeys(node, arr) {
      // 当不是三级权限时，将id传递到数组中
      if (!node.children) {
        return arr.push(node.id)
      }
      // 是三级权限
      node.children.forEach((item) => {
        this.getDefKeys(item, arr)
      })
    },
    // 网络请求
    async getRolesData() {
      const res = await getRolesData()
      this.rolesData = res.data
    },
  },
}
</script>

<style lang='scss' scoped>
.el-tag {
  margin: 7px !important;
}

// 给el-row加上下上边框，垂直居中
.boTop {
  border-top: 1px solid #eee;
}

.boBottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>