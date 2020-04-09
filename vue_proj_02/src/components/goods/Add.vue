<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 提示信息 -->
      <el-alert title="添加商品信息" type="info" :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs 栏 (这些数据需要共同发送至后端，需要 form 表单的包裹) -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- 商品基本信息区域 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品动态参数区域 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单项 -->
            <el-form-item v-for="item in manyTabData" :key="item.attr_id" :label="item.attr_name">
              <!-- 复选框区域 -->
              <el-checkbox-group v-model="item.attr_vals">
                <!-- 注意：复选框渲染时，不能使用索引当做 key 值，否则点击取消勾选时，会移除当前复选框节点 -->
                <el-checkbox border :label="val" v-for="(val, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品静态属性区域 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTabData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片区域 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action 为图片上传地址(需要手动配置请求头的 'token'，因为 upload 自动封装了 AJAX,需要手动重新配置) -->
            <el-upload
              class="upload-demo"
              :headers="uploadHeader"
              action="http://localhost:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容区域(引用富文本编辑器) -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器区域 -->
            <quill-editor v-model="addForm.goods_introduce"/>
            <el-button class="addBtn" type="primary" @click='add'>添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 Dialog -->
    <el-dialog title="提示" :visible.sync="previewVisible" width="50%">
      <img class="previewImg" :src="previewPath" alt="">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: '0', // 步骤条默认激活的属性
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [], // 级联框当前选择的值，为一个数组，最后一项为选中的三级分类 (后台需摇接收以 ',' 号结尾的字符串)
        pics: [], // 图片上传成功后，储存图片临时地址的数组
        goods_introduce: '', // 富文本编辑器内容(商品内容描述)
        attrs: [] // 商品参数的数组
      },
      // 添加表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品信息数据对象
      cateList: [],
      // 级联选择框配置对象
      cateProps: {
        label: 'cat_name', // 当前显示的值
        value: 'cat_id', // 当前选择的值
        children: 'children', // 子选择框属性
        expandTrigger: 'hover' // 悬停触发 cascader
      },
      // 动态参数数据列表
      manyTabData: [],
      // 静态属性数据列表
      onlyTabData: [],
      // 配置 图片上传组件 upload 头部信息
      uploadHeader: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '', // 储存预览图片的 URL
      previewVisible: false // 图片预览对话框的显示与隐藏
    }
  },
  created () {
    this.getCateList() // 初始化页面数据
  },
  methods: {
    // 获取级联框分类数据列表
    getCateList () {
      const res = this.$http.get('categories')
      res.then(val => {
        if (val.data.meta.status !== 200) {
          return this.Message.error('商品数据获取失败')
        }
        this.cateList = val.data.data
        console.log(this.cateList)
      })
    },
    // 监听级联框的改变
    handleChange () {
      console.log(this.selectedKeys)
      console.log(this.addForm.goods_cat)
    },
    // 当 tabs 切换前，触发的函数。 若返回 false 则阻止 tab 页的切换
    beforeTabLeave (active, oldActive) {
      console.log('将离开的标签：', oldActive)
      console.log('将进入的标签：', active)
      if (this.addForm.goods_cat.length !== 3) {
        this.Message.error('请先选择商品分类')
        return false
      }
    },
    // 监听 tab 的切换，并获取 对应 tab页面的 数据
    async tabClicked () {
      // 商品参数 的数据请求与操作
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, {
          params: { sel: 'many' } // 发送 sel 获取动态参数，获取动态参数
        })
        if (res.meta.status !== 200) return this.Message.error('获取商品参数失败')
        console.log(res.data)
        res.data.forEach(item => {
          if (item.attr_vals.length === 0) {
            item.attr_vals = []
          } else {
            item.attr_vals = item.attr_vals.split(',')
          }
        })
        this.manyTabData = res.data
      }
      // 商品属性 的数据请求与操作
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, {
          params: { sel: 'only' } // 发送 sel 获取动态参数，获取静态属性
        })
        if (res.meta.status !== 200) return this.Message.error('获取商品参数失败')
        console.log(res.data)
        this.onlyTabData = res.data
      }
    },
    // 预览图片
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 监听图片上传成功的动作
    handleSuccess (response) {
      // 储存图片的临时地址(response 为当前后台返回的配置对象，包含临时地址)
      console.log(response.data.tmp_path)
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 监听图片移除成功的动作
    handleRemove (file) {
      // file 为当前删除的文件
      // 删除图片时，移除数组中对应的图片临时地址
      console.log(file)
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath) // 返回符合条件的索引值
      this.addForm.pics.splice(i, 1)
    },
    // 点击发送请求以及商品数据，添加商品
    add () {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        console.log('v:', valid)
        if (!valid) return this.Message.error('请将表单信息填写完整')
        const goodCatStr = this.addForm.goods_cat.join(',') // 将商品分类信息转成字符串并以逗号链接
        // 缓存新的请求参数表单对象，并更新分类信息字符串
        const form = this.addForm
        form.goods_cat = goodCatStr
        // 处理动态参数
        this.manyTabData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTabData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        // 发送添加商品请求，商品名称必须唯一
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.Message.error('添加商品失败！')
        this.Message.success('添加商品成功！')
        this.$router.push('/goods') // 跳转商品页面
      })
    }
  },
  // 点击发送请求，发送商品信息并添加商品。
  computed: {
    // 获取级联选择框的三级分类 ID
    cateID () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang='less' scoped>
.el-checkbox {
  margin: 0 8px !important;
}

.previewImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
}
</style>
