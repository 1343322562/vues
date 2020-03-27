<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="userlist" stripe style="width: 100%" border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="200"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column label="状态" width="180">
          <!-- 使用slot-scope属性获取当前作用域的数据，并渲染开关 -->
          <!-- 使用 slot-scope 会覆盖 prop 属性-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="Top Center 提示文字"
              placement="top"
              :enterable="enterable"
            >
              <el-button type="primary" icon="el-icon-edit" circle></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="Top Center 提示文字" placement="top">
              <el-button type="danger" icon="el-icon-delete" circle></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="Top Center 提示文字" placement="top">
              <el-button type="danger" icon="el-icon-setting" circle></el-button>
            </el-tooltip>
            {{scope.row}}
          </template>
        </el-table-column>
      </el-table>
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
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList() // 获取用户数据
  },
  data() {
    return {
      enterable: false, // tooltip 指针悬停隐藏
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0 // 用户数量
    }
  },
  methods: {
    getUserList() {
      const res = this.$http.get('users', { params: this.queryInfo })
      res.then(val => {
        if (val.data.meta.status !== 200) return this.Message.error('数据用户列表失败')
        console.log('用户数据:', val.data.data)
        this.userlist = val.data.data.users
        this.total = val.data.data.total
      })
    },
    // 监听 pagesize 的改变 ,每页显示条数改动后触发
    handleSizeChange (newsize) {
      console.log(newsize)
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    // 监听 页码值的改变
    handleCurrentChange (newpage) {
      console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    }
  }
}
</script>

<style lang='less' scoped>
.box-card {
  margin-top: 15px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2) !important;
}

.el-table {
  margin-top: 15px;
}

.el-pagination {
  margin-top: 15px;
}
</style>
