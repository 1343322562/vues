<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!-- tree 表格 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        stripe
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" v-if="scope.row.cat_deleted === true"></i>
        </template>
        <!-- 等级排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="showAlterCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
     <el-dialog title="添加分类" :visible.sync="addCateDialog" width="30%">
      <!-- 表单区域 -->
      <span>
        <el-form :model="addCateFrom" :rules="CateFromRules" ref="addCateFromRef" label-width="100px" class="demo-ruleForm" @close="resetForm">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateFrom.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- 级联选择器( options 储存数据源, v-model 储存当前选择项的数组) -->
            <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
            placeholder="请选择(默认为一级分类)">
            </el-cascader>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分类编辑对话框 -->
     <el-dialog title="分类信息编辑" :visible.sync="alterCateDialog" width="30%">
      <!-- 表单区域 -->
      <span>
        <el-form :model="alterCateFrom" :rules="CateFromRules" ref="alterCateFromRef" label-width="100px" class="demo-ruleForm" @close="resetForm">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="alterCateFrom.cat_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alterCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="alterCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList() // 加载商品分页数据
  },
  data() {
    return {
      alterCateDialog: false, // 控制修改分类信息对话框的出现于隐藏
      addCateDialog: false, // 控制添加分类对话框的出现于隐藏
      // 修改分类信息表单数据对象
      alterCateFrom: {
        id: '',
        cat_name: '',
        cat_level: ''
      },
      // 添加分类的表单数据对象
      addCateFrom: {
        // 需要添加的分类名称
        cat_name: '',
        // 父类的分类 ID
        cat_pid: 0,
        // 分类的等级，默认一级分类
        cat_level: 0
      },
      // 添加分类的表单校验规则
      CateFromRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的数据列表（实现 添加分类 => 级联选择器）
      parentCateList: [],
      // 选中的父级分类数组
      selectedKeys: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 查询条件（分类 ， 层级）
      queryInfo: {
        type: 3, // 分类显示层级，默认会显示三层，在添加分类对话框中会设置为两层
        pagenum: 1, // 当前所在页面
        pagesize: 5 // 每页显示条数
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // tree-table定义列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 当前列定义为模板列
          type: 'template',
          // 当前列的模板名称为 isok
          template: 'isok'
        },
        {
          label: '排序',
          // 当前列定义为模板列
          type: 'template',
          // 当前列的模板名称为 order
          template: 'order'
        },
        {
          label: '操作',
          // 当前列定义为模板列
          type: 'template',
          // 当前列的模板名称为 opt
          template: 'opt'
        }
      ]
    }
  },
  methods: {
    // 判断 sessionStorage 中是否有保存页码状态
    pageInfo () {
      const newPagesize = window.sessionStorage.getItem('cateNewPageSize')
      const newPagenum = window.sessionStorage.getItem('cateNewPageNum')
      if (newPagesize) this.queryInfo.pagesize = parseInt(newPagesize)
      if (newPagenum) this.queryInfo.pagenum = parseInt(newPagenum)
      console.log(newPagenum, newPagesize)
    },
    // 获取商品分页数据
    getCateList() {
      // 判断是否有被保存的页码状态
      this.pageInfo()
      // 请求数据
      const res = this.$http.get('categories', { params: this.queryInfo })
      res.then(val => {
        console.log(val)
        if (val.data.meta.status !== 200) return this.Message.error('获取商品分页数据失败')
        this.cateList = val.data.data.result // 商品列表
        this.total = val.data.data.total // 商品总条数
      })
    },
    // 监听表单的关闭，重置表单
    resetForm () {
      try {
        this.$refs.addCateFromRef.resetFields()
        this.selectedKeys = []
        this.addCateFrom.cat_pid = 0
        this.addCateFrom.cat_level = 0
      } catch (error) {
        console.log(error, 'addCateFromRef 未被渲染(修改商品分类信息的 Dialog 未被渲染)')
      }
      try {
        this.$refs.alterCateFromRef.resetFields()
      } catch (error) {
        console.log(error, 'alterCateFromRef 未被渲染(修改商品分类信息的 Dialog 未被渲染)')
      }
      // this.$refs.addCateFromRef.resetFields()
      // this.selectedKeys = []
      // this.addCateFrom.cat_pid = 0
      // this.addCateFrom.cat_level = 0
      // this.$refs.alterCateFromRef.resetFields()
    },
    // 监听分页区域页面改变, 并使用 sessionStorage 储存页码状态
    handleSizeChange (newSize) {
      window.sessionStorage.setItem('cateNewPageSize', newSize)
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页面显示数量的改变，并使用 sessionStorage 储存页码状态
    handleCurrentChange (newNum) {
      window.sessionStorage.setItem('cateNewPageNum', newNum)
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 点击展示添加商品对话框
    showAddCateDialog () {
      this.getParentCateList() // 获取级联选择器的数据
      this.addCateDialog = true
    },
    // 获得父级分类的数据列表（渲染添加分类对话框中的级联选择器）
    getParentCateList () {
      const res = this.$http.get('categories', {
        params: { type: 2 } // 设置级联表的层级
      })
      res.then(val => {
        console.log(val)
        if (val.data.meta.status !== 200) return this.Message.error('获取父级分类数据失败')
        this.parentCateList = val.data.data
      })
    },
    // 监听级联选择器的数据变化
    parentCateChanged () {
      const selKeys = this.selectedKeys // 被选中的类名数组
      console.log(selKeys)
      if (selKeys.length > 0) {
        this.addCateFrom.cat_pid = selKeys[selKeys.length - 1]
        this.addCateFrom.cat_level = selKeys.length
      } else {
        this.addCateFrom.cat_pid = 0
        this.addCateFrom.cat_level = 0
      }
    },
    // 点击确定进行表单预验证，发送表单数据，获取最新分类数据
    addCate () {
      console.log(this.addCateFrom)
      this.$refs.addCateFromRef.validate(valid => {
        console.log(valid)
        if (!valid) return
        const res = this.$http.post('categories', this.addCateFrom)
        res.then(val => {
          if (val.data.meta.status !== 201) return this.Message.error('添加分类失败')
          this.Message.success('添加分类成功')
          this.getCateList()
          this.addCateDialog = false
        })
      })
    },
    // 监听分类编辑按钮。弹出对话框 并 初始化 Dialog 表单信息
    showAlterCateDialog (val) {
      console.log(val)
      // 根据 slot-scope ，初始化表单数据
      this.alterCateFrom.cat_name = val.cat_name
      this.alterCateFrom.cat_id = val.cat_id
      this.alterCateFrom.cat_level = val.cat_level
      this.alterCateDialog = true
    },
    // 点击进行表单预验证，更新最新信息并获取最新数据
    alterCate () {
      this.$refs.alterCateFromRef.validate(valid => {
        if (!valid) return
        const res = this.$http.put('categories/' + this.alterCateFrom.cat_id, {
          cat_name: this.alterCateFrom.cat_name,
          cat_lever: this.alterCateFrom.cat_level
        })
        res.then(val => {
          console.log(val)
          if (val.data.meta.status !== 200) return this.Message.error('编辑信息失败')
          this.Message.success('编辑信息成功')
          this.alterCateDialog = false
          this.getCateList()
        })
      })
    },
    // 根据 id 值删除对应的节点信息
    async deleteCate (id) {
      console.log(id)
      const confirmRes = await this.$confirm('此操作将永久删除此分类，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err) // 捕获错误
      console.log(confirmRes)
      // 取消删除返回 cancel
      // 确认删除返回 confirm
      if (confirmRes !== 'confirm') return this.Message.info('已取消删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      console.log(res, id)
      if (res.meta.status !== 200) return this.Message.error('删除失败')
      this.Message.success('删除分类成功')
      // 当删除的项为当前页面最后一项时，改变 sessionStorage 中的 page 值，回到上一页面。
      if (this.total % this.queryInfo.pagesize === 0) {
        window.sessionStorage.setItem('cateNewPageNum', this.queryInfo.pagenum - 1)
      }
      this.getCateList() // 刷新数据
    }
  }
}
</script>

<style lang="less" scoped>
.el-icon-success {
  color: lightgreen;
}
.el-icon-error {
  color: lightseagreen;
}
.tree-table {
  margin: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
