<template>
  <div id="login">
    <vue-particles
      class="login-bg"
      color="#39AFFD"
      :particleOpacity="0.7"
      :particlesNumber="100"
      shapeType="circle"
      :particleSize="4"
      linesColor="#8DD1FE"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="3"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    >
    </vue-particles>
    <div class="login_wrapper">
      <div class="login_logo">
        <img src="@/assets/images/logo.png" alt="" />
      </div>
      <div class="login_form">
        <el-form
          ref="login_form"
          :model="ruleForm"
          :rules="rules"
          label-width="80px"
        >
          <el-form-item prop="username">
            <el-input
              v-model="ruleForm.username"
              prefix-icon="el-icon-user-solid"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="ruleForm.password"
              type="password"
              prefix-icon="el-icon-lock"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="login_btn">
        <el-button type="primary" @click="loginForm">登录</el-button>
        <el-button type="info" @click="resetForm">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getLogin } from '@/network/login'
export default {
  name: 'Login',
  data() {
    return {
      ruleForm: {
        username: 'admin',
        password: '123456',
      },
      rules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 10,
            message: '长度在 5 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 10,
            message: '长度在 6 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    resetForm() {
      this.$refs.login_form.resetFields()
    },
    loginForm() {
      // 点击登录，通过validate校验，在回调函数 vaild中得到结果
      this.$refs.login_form.validate(async (valid) => {
        if (!valid) return
        // 发送网络请求
        const res = await getLogin(
          this.ruleForm.username,
          this.ruleForm.password
        )
        if (res.meta.status !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功！')
        console.log(res);
        // 登录成功后，将token存入缓存中（并且跳转到Home页面）
        const { token } = res.data
        window.sessionStorage.setItem('token', token)
        this.$router.push('/Home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
  #login {
    width: 100%;
    height: 100%;
    .login-bg {
      height: 100%;
      width: 100%;
      background: #3e3e3e;
    }
    .login_wrapper {
      height: 350px;
      width: 500px;
      background-color: #fff;
      border-radius: 5px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .login_logo {
        height: 150px;
        background-color: #ddd;
        width: 150px;
        border-radius: 50%;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        top: -22%;
        img {
          background-color: #fff;
          width: 125px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 7.5%;
          border-radius: 50%;
        }
      }
      .login_form {
        padding-right: 65px;
        margin-top: -20px;
      }
      .login_btn {
        position: absolute;
        right: 60px;
      }
    }
  }
</style>
