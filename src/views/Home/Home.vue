<template>
  <div id="home">
    <el-container class="container">
      <el-header>
        <div class="logo_title">
          <img src="@/assets/images/heima.png" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container class="el-container">
        <el-aside :width="isCollaspe ? '60px' : '200px'">
          <!--
          el-menu一般设置属性。
          el-submenu一级菜单和el-menu-item二级菜单，用作遍历。
          绑定index值是唯一的，才不会和unique-opened冲突。
           -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#24acf2"
            unique-opened
            :collapse="isCollaspe"
            :collapse-transition="false"
            router
            :default-active="activePath"
          >
            <div class="collapse" @click="collapseMenu">|||</div>
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
              <template slot="title">
                <i class="icon" :class="icons[item.id]"></i>
                <span>{{ item.authName }}</span>
              </template>
              <!-- 绑定index，作为 router的跳转path -->
              <el-menu-item v-for="item1 in item.children" :key="item1.id" :index="item1.path" @click="activeTab(item1.path)">
                <i class="el-icon-menu"></i>
                {{ item1.authName }}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
    <!-- 弹窗是否退出登录 -->
    <el-dialog title="是否退出登录?" :visible.sync="logoutDialogVisible" width="30%" @close="closeLogout">
      <span slot="footer">
        <el-button @click="logoutDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="logoutDia">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getMenuData } from '@/network/home'
export default {
  name: 'Home',
  data() {
    return {
      menuList: [],
      icons: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-claim',
        101: 'el-icon-s-cooperation',
        102: 'el-icon-s-order',
        145: 'el-icon-data-line',
      },
      isCollaspe: false,
      // 保存菜单栏的激活状态
      activePath: '',
      // 退出弹窗
      logoutDialogVisible: false,
    }
  },
  created() {
    this.getMenuData()
    // 当页面被创建时，获取activePath
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      this.logoutDialogVisible = true
    },
    closeLogout() {
      this.logoutDialogVisible = false
    },
    logoutDia() {
      // 点击退出，清空token，并且返回登录页面
      window.sessionStorage.clear()
      this.$router.push('/Login')
      this.$message.success('退出登录成功！')
    },
    collapseMenu() {
      this.isCollaspe = !this.isCollaspe
    },
    // 激活菜单状态
    activeTab(activePath) {
      // 将激活的路径存入sessionStorage中
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },

    // 请求菜单列表数据
    async getMenuData() {
      const res = await getMenuData()
      this.menuList = res.data
    },
  },
}
</script>

<style lang='less' scoped>
#home {
  .container {
    height: 100vh;
    .el-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #373d41;
      .logo_title {
        display: flex;
        align-items: center;
        img {
          width: 60px;
        }
        span {
          color: #fff;
          font-size: 22px;
          margin-left: 20px;
        }
      }
    }
    .el-container {
      .el-aside {
        background-color: #333744;
        .el-menu {
          // 清除el-menu组件默认的样式
          border-right: none;
        }
        .collapse {
          // width: 200px;
          height: 30px;
          cursor: pointer;
          text-align: center;
          color: #fff;
          line-height: 30px;
          background-color: #292c36;
        }
        .icon {
          margin-right: 20px;
        }
      }
      .el-main {
        background-color: #eaedf1;
      }
    }
  }
}
</style>
