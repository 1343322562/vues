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
        <el-table-column prop="goods_weight" label="商品重量" width="80"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180">
          <!-- 使用全局过滤器(处理时间格式) -->
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-setting">编辑</el-button>
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
      total: 0 // 总数据条数
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
    }
  }
}
</script>

<style lang='less' scoped>
</style>
