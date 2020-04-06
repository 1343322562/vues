<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 警告提示区域 -->
      <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>
      <!-- 商品分类选择区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类数据：</span>
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的区域 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数 table -->
          <el-table :data="manyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- tag 标签 区域 -->
              <template slot-scope="scope">
                <el-tag closable @close="handleClose(i, scope.row)" v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="alterParamsDialog(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的区域 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性 table -->
          <el-table :data="onlyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- tag 标签 区域 -->
              <template slot-scope="scope">
                <el-tag closable @close="handleClose(i, scope.row)" v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="alterParamsDialog(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数以及静态属性的 Dialog -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="30%" @close="resetForm">
      <!-- 表单区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改信息的 Dialog -->
    <el-dialog :title="'修改' + titleText" :visible.sync="alterDialogVisible" width="30%" @close="resetForm">
      <!-- 表单区域 -->
      <el-form :model="alterForm" :rules="alterFormRules" ref="alterFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="alterForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alterDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="alterParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有分类商品的数据
      cateList: [],
      // 级联选择框，选中项绑定数组
      selectedCateKeys: [],
      // 级联选择框配置对象
      cateProps: {
        value: 'cat_id', // 当前选中的值
        label: 'cat_name', // 当前显示的值
        children: 'children', // 嵌套属性
        expandTrigger: 'hover' // hover 展开下级菜单
      },
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 添加 动态参数\静态属性的 Dialog 显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单信息的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改信息的数据对象
      alterForm: {
        attr_id: '',
        attr_name: ''
      },
      // 控制修改表单信息的 Dialog 显示与隐藏
      alterDialogVisible: false,
      // 修改信息的验证规则对象
      alterFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList() // 获取所有商品分类列表
  },
  methods: {
    // 获取所有商品分类列表
    getCateList () {
      const res = this.$http.get('categories')
      res.then(val => {
        console.log(val)
        if (val.data.meta.status !== 200) return this.Message.error('获取商品分类信息失败')
        this.cateList = val.data.data
      })
    },
    // 监听级联选择框选中项改变,获取数据
    handleChange () {
      this.getParamsData()
    },
    // 监听页签的改变,获取数据
    handleClick () {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 定义 tab页 以及 级联选择框 的数据获取函数
    getParamsData () {
      console.log(this.selectedCateKeys)
      // 若 级联选择器 未选择第三级别，将禁用添加按钮并清空表单数据
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据当前选中 ID 以及 tab 页，获取对应数据
      const res = this.$http.get(`categories/${this.cateID}/attributes`, {
        params: { sel: this.activeName }
      })
      res.then(val => {
        console.log(val.data.data)
        // 处理数据中用于渲染 tag标签 的 attr_vals 属性，
        val.data.data.forEach(item => {
          console.log('s:', item.attr_vals.split(' ') || [])
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制 tag添加框 的显示与隐藏
          item.inputVisible = false
          // tag添加框 中的值
          item.inputValue = ''
        })
        if (val.data.meta.status !== 200) return this.Message.error('获取参数列表失败')
        // 按需求更新表格数据
        if (this.activeName === 'many') {
          this.manyTableData = val.data.data
        } else {
          this.onlyTableData = val.data.data
        }
      })
    },
    // 重置表单数据
    resetForm () {
      try {
        this.$refs.addFormRef.resetFields()
        this.Message.info('已取消添加')
      } catch (error) {
        console.log(error, 'addFormRef 未被渲染(修改商品分类信息的 Dialog 未被渲染)')
      }
      try {
        this.$refs.alterFormRef.resetFields()
        this.Message.info('已取消修改')
      } catch (error) {
        console.log(error, 'alterFormRules 未被渲染(修改商品分类信息的 Dialog 未被渲染)')
      }
    },
    // 点击按钮，进行表单预验证，并发送数据请求
    addParams () {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return
        const res = this.$http.post(`categories/${this.cateID}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        res.then(val => {
          console.log(val)
          if (val.data.meta.status !== 201) return this.Message.error('添加参数失败')
          this.Message.success('添加参数成功')
          this.addDialogVisible = false
          this.getParamsData()
        })
      })
    },
    // 点击按钮，显示修改 参数\属性 对话框
    alterParamsDialog (scope) {
      console.log(scope.attr_name, scope)
      // 根据 scope 来更新 表单数据对象 中的值。从而达到 input 中显示当前默认值
      this.alterForm.attr_name = scope.attr_name
      this.alterForm.attr_id = scope.attr_id
      this.alterDialogVisible = true
    },
    // 点击确定，表单预验证，并请求数据
    alterParams () {
      this.$refs.alterFormRef.validate(valid => {
        if (!valid) return
        const res = this.$http.put(`categories/${this.cateID}/attributes/${this.alterForm.attr_id}`, {
          attr_name: this.alterForm.attr_name,
          attr_sel: this.activeName
        })
        res.then(val => {
          console.log(val)
          if (val.data.meta.status !== 200) return this.Message.error('修改信息失败')
          this.Message.success('修改信息成功')
          this.getParamsData()
          this.alterDialogVisible = false
        })
      })
    },
    // 根据 ID 删除对应的信息
    deleteParam (id) {
      const confirmRes = this.$confirm('此操作会将对应信息永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => console.log(err))
      confirmRes.then(val => {
        console.log(val)
        if (val !== 'confirm') return this.Message.info('已取消删除!')
        const res = this.$http.delete(`categories/${this.cateID}/attributes/${id}`)
        res.then(val => {
          console.log(val, [this.cateID, this.alterForm.attr_id])
          if (val.data.meta.status !== 200) return this.Message.error('删除失败！')
          this.Message.success('删除成功！')
          this.getParamsData()
        })
      })
    },
    // 将对 attr_vals 的操作，更新到数据库中
    saveAttrVals (scope) {
      console.log(scope)
      // 将添加的值发送至后台，更新数据
      const res = this.$http.put(`categories/${this.cateID}/attributes/${scope.attr_id}`, {
        attr_name: scope.attr_name,
        attr_sel: this.activeName,
        attr_vals: scope.attr_vals.join(' ')
      })
      res.then(val => {
        console.log(val)
        if (val.data.meta.status !== 200) return this.Message.error('修改参数项失败！')
        this.Message.success('修改参数项成功！')
      })
    },
    // 监听 tag添加框 失焦以及 enter键 的按下
    handleInputConfirm (scope) {
      if (scope.inputValue.trim().length === 0) {
        scope.inputValue = '' // 满足条件，重置表单
        scope.inputVisible = false
        return
      }
      // 将新的 tag值 推入当前的 tag数组 中，并重置当前 input框的值
      scope.attr_vals.push(scope.inputValue.trim())
      scope.inputValue = ''
      scope.inputVisible = false
      this.saveAttrVals(scope) // 将添加的值发送至后台，更新数据
    },
    // 点击 tag添加框 出现
    showInput (scope) {
      scope.inputVisible = true
      // 添加框出现时自动获取焦点，$nextTick(()=>{})：当页面的元素重新被渲染后，才会执行回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 根据当前 tag项的索引 删除对应的 tag 标签
    handleClose (i, scope) {
      scope.attr_vals.splice(i, 1)
      this.saveAttrVals(scope) // 将删除后的 attr_vals 发送至后台，更新数据
    }
  },
  computed: {
    // 按钮是否被禁用
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中分类对应的 ID 值
    cateID () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算添加动态参数以及静态属性的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang='less' scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 150px;
}
</style>
