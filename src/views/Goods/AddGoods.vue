<template>
  <div id="addGoods">
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="never">
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="active" finish-status="success" align-center>
        <el-step title="商品信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 用form表单包裹tab标签 -->
      <el-form label-position="top" :model="baseForm" :rules="baseRules" ref="baseFormRef" label-width="100px">
        <!-- Tab标签，动态绑定before-leave，监听标签切换-->
        <el-tabs :before-leave="tabLeave" tab-position="left" v-model="activeName" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="baseForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="baseForm.goods_price" @input="changeInput"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="baseForm.goods_weight" @input="changeInput"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="baseForm.goods_number" @input="changeInput"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-alert class="warningalert" title="注意：只允许为第三级分类设置相关参数" :closable="false" type="warning" show-icon></el-alert>
              <el-cascader
                clearable
                v-model="baseForm.goods_cat"
                :options="CascaderList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children',
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 双层遍历 -->
            <!-- 商品参数名称 -->
            <el-form-item :label="item.attr_name" v-for="(item, index) in activeParams" :key="item.attr_id">
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border size="medium" :label="item1" v-for="(item1, index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="(item, index) in staticProps" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片，action服务器的url，headers接口的请求头（对象形式） -->
            <el-upload
              :action="actionURL"
              :headers="headers"
              :on-success="uploadSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor ref="myTextEditor" v-model="baseForm.goods_introduce"></quill-editor>
            <el-button class="addBtn" type="primary" @click="addBtnGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
      <img :src="prePic" alt="" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script>
import { getCascaderData, getCateParams } from '@/network/cateParams'
import { addGoods } from '@/network/goods'
export default {
  name: 'AddGoods',
  data() {
    return {
      // 分类id
      cateId: '',
      // 动态参数和静态属性数据
      activeParams: [],
      staticProps: [],
      // 级联数据
      CascaderList: [],
      // active为步骤条的激活（number类型），activeName为tab切换的激活（string类型）
      active: 0,
      activeName: '0',
      // 表单数据
      baseForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: [],
      },
      // 深拷贝的表单数据
      deepBaseForm: {},
      baseRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
      },
      actionURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      prePic: '',
      picDialogVisible: false,
    }
  },
  created() {
    this.getCascaderData()
  },
  computed: {
    // 上传图片的headers
    headers() {
      return {
        Authorization: window.sessionStorage.getItem('token'),
      }
    },
  },
  methods: {
    // 输入框只能输入数字（或者通过自定义校验规则）
    changeInput() {
      const pattern = /^[1-9][0-9]*$/
      if (!pattern.test(this.baseForm.goods_price) && !pattern.test(this.baseForm.goods_number) && !pattern.test(this.baseForm.goods_weight)) {
        this.$message.error('只能输入正整数')
        this.baseForm.goods_price = ''
        this.baseForm.goods_number = ''
        this.baseForm.goods_weight = ''
      }
    },
    // tab与step联动效果
    tabClick() {
      this.active = this.activeName - 0
      if (this.activeName === '1') {
        this.getCateParams()
      } else if (this.activeName === '2') {
        this.getCateStatic()
      }
    },
    handleChange() {
      if (this.baseForm.goods_cat.length !== 3) {
        this.baseForm.goods_cat = []
      }
      // 获取分类id
      this.cateId = this.baseForm.goods_cat[this.baseForm.goods_cat.length - 1]
    },
    // tabs标签的切换
    tabLeave(activeName, oldActiveName) {
      // 当激活的是第一个tab和选中的分类数组长度不为3时，不能切换tabs
      if (activeName !== '0' && this.baseForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类！')
        return false
      }
    },
    // 图片的预览、图片的删除、图片上传成功将数据赋值给baseForm
    handlePreview(file) {
      this.prePic = file.response.data.url
      this.picDialogVisible = true
    },
    handleRemove(file) {
      // 通过下标删除splice，findIndex查询下标值
      const delPic = file.response.data.tmp_path
      const i = this.baseForm.pics.findIndex((n) => n.pic === delPic)
      this.baseForm.pics.splice(i, 1)
    },
    uploadSuccess(file) {
      // 作为对象数据push到pics数组中
      const picInfo = { pic: file.data.tmp_path }
      this.baseForm.pics.push(picInfo)
    },
    // 添加商品
    addBtnGoods() {
      this.$refs.baseFormRef.validate(async (valid) => {
        if (!valid) return $this.$message.error('请填写商品基本信息！')
        // 添加商品逻辑
        // 由于请求接口goods_cat是字符串形式，所有要进行转换。而goods_cat又双向绑定级联选择器，不能进行转换
        // 通过深拷贝生成新对象，再进行转换
        this.deepBaseForm = JSON.parse(JSON.stringify(this.baseForm))
        this.deepBaseForm.goods_cat = this.deepBaseForm.goods_cat.join(',')

        // 处理attrs数据（动态参数、静态属性）
        this.activeParams.forEach((item) => {
          const newParams = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.baseForm.attrs.push(newParams)
        })
        this.staticProps.forEach((item) => {
          const newProps = { attr_id: item.attr_id, attr_value: item.attr_vals.join }
          this.baseForm.attrs.push(newProps)
        })
        // 将attrs数据传递给深拷贝的对象
        this.deepBaseForm.attrs = this.baseForm.attrs
        const res = await addGoods(this.deepBaseForm)
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    },
    // 获取商品分类数据
    async getCascaderData() {
      const res = await getCascaderData()
      this.CascaderList = res.data
    },
    // 获取动态参数
    async getCateParams() {
      const res = await getCateParams(this.cateId, 'many')
      // 获取动态参数下的attr_vals值（转换成数组方式）
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
      })
      this.activeParams = res.data
    },
    // 获取静态属性
    async getCateStatic() {
      const res = await getCateParams(this.cateId, 'only')
      this.staticProps = res.data
    },
  },
}
</script>

<style lang='scss' scoped>
.warningalert {
  height: 40px;
  width: 300px;
  margin-bottom: 20px;
}
.el-checkbox {
  margin: 0;
}
.addBtn {
  margin-top: 20px !important;
}
</style>