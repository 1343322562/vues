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
          <el-input
            placeholder="请输入内容(按姓名搜索)"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" @click="showAddDialog = true">添加用户</el-button>
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
          <!-- 使用 slot-scope 属性获取当前作用域的数据，并渲染开关 -->
          <!-- 使用 slot-scope 会覆盖 prop 属性-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row.id)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="修改用户信息"
              placement="top"
              :enterable="enterable"
            >
              <el-button @click="alterUserInfoDialog(scope.row)" type="primary" icon="el-icon-edit" circle :enterable="enterable"></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除用户信息"
              placement="top"
              :enterable="enterable"
            >
              <el-button type="danger" icon="el-icon-delete" circle @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="Top Center 提示文字"
              placement="top"
              enterable
            >
              <el-button type="danger" icon="el-icon-setting" circle :enterable="enterable"></el-button>
            </el-tooltip>
            <!-- 使用 slot-scope 必须要使用scope.row ，否则报错 -->
          </template>
        </el-table-column>
      </el-table>
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
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="showAddDialog" width="30%" @close="resetDialog">
      <!-- 表单区域 -->
      <span>
        <el-form :model="addUsersFrom" :rules="addUsersFromRules" ref="addUsersFromRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="addUsersFrom.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUsersFrom.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUsersFrom.email" type="email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUsersFrom.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="showAlterDialog" width="30%" @close="resetDialog">
      <!-- 表单区域 -->
      <span>
        <el-form :model="editFrom" :rules="alterUserInfoRules" ref="alterUserInfoRef" label-width="100px">
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="editFrom.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editFrom.email" type="email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editFrom.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAlterDialog = false">取 消</el-button>
        <el-button type="primary" @click="alterUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList() // 获取用户数据
  },
  data() {
    // 邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      var regEmail = /^\w+@\w+(\.\w+)+$/
      if (!regEmail.test(value)) {
        // 不合法的邮箱
        return callback(new Error('请输入合法的邮箱'))
      }
      callback()
    }
    // 手机号验证规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (!regMobile.test(value)) {
        return callback(new Error('请输入合法的手机号'))
      }
      callback()
    }
    return {
      showAlterDialog: false, // 修改用户信息对话框的显示与隐藏
      showAddDialog: false, // 控制添加用户对话框的显示与隐藏
      enterable: false, // tooltip 指针悬停隐藏
      // 添加用户的表单数据
      addUsersFrom: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 用户信息
      editFrom: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      // 添加表单验证规则对象(修改用户信息)
      alterUserInfoRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      },
      // 添加表单验证规则对象(添加用户)
      addUsersFromRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      },
      // 获取用户列表的参数对象
      queryInfo: {
        query: '', // 搜索框关键字
        pagenum: 1, // 当前所在页数
        pagesize: 2 // pagesizes
      },
      userlist: [], // 用户信息
      total: 0 // 用户数量
    }
  },
  methods: {
    // 获取用户数据
    getUserList() {
      const res = this.$http.get('users', { params: this.queryInfo })
      res.then(val => {
        if (val.data.meta.status !== 200) return this.Message.error('数据用户列表失败')
        console.log('用户数据:', val.data.data)
        this.userlist = val.data.data.users
        this.total = val.data.data.total
      })
    },
    // 监听 pagesizes 的改变 ,每页显示条数改动后触发
    handleSizeChange(newsize) {
      console.log(newsize)
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    // 监听 页码值 的改变
    handleCurrentChange(newpage) {
      console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    // 监听状态开关的改变
    userStateChanged(switchState) {
      console.log('swichState:', switchState.mg_state)
      const res = this.$http.put(
        `users/${switchState.id}/state/${switchState.mg_state}`
      )
      res.then(val => {
        if (val.data.meta.status !== 200) {
          switchState.mg_state = !switchState.mg_state
          return this.Message.error('更新用户状态失败')
        }
        this.Message.success('更新用户状态成功')
      })
    },
    // 监听 Dialog 关闭事件
    resetDialog () {
      try {
        this.$refs.addUsersFromRef.resetFields()
      } catch (error) {
        console.log(error, 'addUsersFromRef 未被渲染(添加用户的 Dialog 未被渲染)')
      }
      try {
        this.$refs.alterUserInfoRef.resetFields()
      } catch (error) {
        console.log(error, 'alterUserInfoRef 未被渲染(修改用户信息的 Dialog 未被渲染)')
      }
      console.log(1)
    },
    // 表单预验证, 点击按钮添加新用户
    addUser () {
      this.$refs.addUsersFromRef.validate(valid => {
        console.log(valid)
        if (!valid) return
        const res = this.$http.post('users', this.addUsersFrom)
        res.then(val => {
          if (val.data.meta.status !== 201) {
            return this.Message.error('添加用户失败')
          }
          this.Message.success('添加用户成功')
          this.showAddDialog = false // 关闭对话框
          this.getUserList() // 更新添加后的用户数据
        })
      })
    },
    // 修改用户信息对话框
    alterUserInfoDialog (val) {
      this.showAlterDialog = true
      console.log(val)
      this.editFrom.id = val.id
      this.editFrom.username = val.username
      this.editFrom.mobile = val.mobile
      this.editFrom.email = val.email
    },
    // 发送并获得修改后的用户信息
    alterUserInfo () {
      this.$refs.alterUserInfoRef.validate(valid => {
        console.log(valid, this.editFrom)
        if (!valid) return
        const res = this.$http.put('users/' + this.editFrom.id, {
          email: this.editFrom.email,
          mobile: this.editFrom.mobile
        })
        res.then(val => {
          console.log(val)
          if (val.data.meta.status !== 200) {
            return this.Message.error('修改用户信息失败')
          }
          this.Message.success('修改用户信息成功')
          this.showAlterDialog = false // 关闭对话框
          this.getUserList() // 更新添加后的用户数据
        })
      })
    },
    // 根据ID删除用户
    async deleteUser (id) {
      console.log(id)
      // 用户确认删除弹出框
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err) // 捕获错误
      // 取消删除返回 cancel
      // 确认删除返回 confirm
      console.log(confirmRes)
      if (confirmRes !== 'confirm') {
        return this.Message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.Message.error('删除用户失败')
      this.Message.success('删除用户成功')
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
