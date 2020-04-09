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
      <!-- 搜索框\添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable @clear="getGoodsList" placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGood">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="740"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="80"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量(kg)" width="80"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180">
          <!-- 使用全局过滤器(处理时间格式) -->
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-setting" @click="alterGoodInfo(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteGoodById(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改商品信息的 Dialog -->
    <el-dialog title="编辑商品信息" :visible.sync="alterDialogVisible" width="50%">
      <!-- 表单区域 -->
      <el-form :model="alterForm" :rules="alterFormRules" ref="alterFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="alterForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item type="number" label="商品价格(元)" prop="goods_name">
          <el-input v-model="alterForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item type="number" class="noWarp" label="商品重量(kg)" prop="goods_name">
          <el-input v-model="alterForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item type="number" label="商品数量" prop="goods_number">
          <el-input v-model="alterForm.goods_number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alterDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="alterGood">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询以及分页参数对象
      queryInfo: {
        query: '', // 搜索关键字
        pagenum: 1, // 当前所在页面
        pagesize: 2 // 每页显示的数据条数
      },
      // 商品列表
      goodsList: [],
      total: 0, // 总数据条数
      alterDialogVisible: false, // 控制修改商品信息的对话框
      // 修改信息表单数据对象
      alterForm: {
        goods_id: '',
        goods_name: '',
        goods_price: '',
        good_weight: ''
      },
      // 修改信息表单的验证规则
      alterFormRules: {
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
        ]
      }
    }
  },
  created() {
    this.getGoodsList() // 获取商品列表
  },
  methods: {
    // 获取商品列表
    getGoodsList() {
      const res = this.$http.get('goods', {
        params: this.queryInfo
      })
      res.then(val => {
        console.log(val.data.data)
        if (val.data.meta.status !== 200) {
          return this.Message.error('获取商品列表失败')
        }
        this.goodsList = val.data.data.goods
        this.total = val.data.data.total
      })
    },
    // 监听商品每页显示数量的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听当前页面的改变
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 根据 id 删除对应的商品
    deleteGoodById (id) {
      console.log(id)
      const confirmRes = this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => console.log(err))
      console.log(id)
      confirmRes.then(confirm => {
        if (confirm !== 'confirm') return this.Message.info('已取消删除')
        console.log(id)
        const res = this.$http.delete(`goods/${id}`)
        res.then(val => {
          console.log(id, val)
          if (val.data.meta.status !== 200) return this.Message.error('删除失败')
          this.Message.success('删除成功')
          this.getGoodsList()
        })
      })
    },
    // 点击跳转添加商品组件
    goAddGood () {
      this.$router.push('/goods/add')
    },
    // 监听编辑按钮,导入 scope 数据，并打开 Dialog
    alterGoodInfo (scope) {
      this.alterForm.goods_id = scope.goods_id
      this.alterForm.goods_number = scope.goods_number
      this.alterForm.goods_name = scope.goods_name
      this.alterForm.goods_price = scope.goods_price
      this.alterForm.goods_weight = scope.goods_weight
      this.alterDialogVisible = true
    },
    // 点击发送修改商品请求
    alterGood () {
      this.$refs.alterFormRef.validate(async valid => {
        if (!valid) return
        this.$confirm('因为 goods页面 获取不到商品分类信息，所以无法实现此功能', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(val => {
          this.alterDialogVisible = false
        })
        // const { data: res } = await this.$http.put('goods/' + this.alterForm.goods_id, {
        //   goods_name: this.alterForm.goods_name,
        //   goods_price: this.alterForm.goods_price,
        //   goods_weight: this.alterForm.goods_weight,
        //   goods_number: this.alterForm.goods_number
        // })
        // console.log(res) 没有后台没有发来分类信息，无法实现此功能
      })
    }
  }
}
</script>

<style lang='less' scoped>
.noWarp{
  white-space: nowrap;
}
</style>
