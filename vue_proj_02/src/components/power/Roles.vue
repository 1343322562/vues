<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 == 0 ? 'bdtop': '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag><i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级以及三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '': 'bdtop']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag><i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col class="arrange" :span="18">
                    <!-- 渲染三级权限 -->
                    <el-row :class="[i3 === 0 ? '': 'bdtop']" v-for="(item3, i3) in item2.children" :key="item3.id">
                      <el-col>
                        <el-tag type="warning">{{item3.authName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="alterRoleInfoDialog(scope.row)">编辑</el-button>
            <el-button type="primary" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="primary" icon="el-icon-setting">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="showAddDialog" width="30%" @close="resetDialog">
      <!-- 表单区域 -->
      <span>
        <el-form :model="addRoleFrom" :rules="RoleFromRules" ref="addRoleFromRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleFrom.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleFrom.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
     <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改角色信息" :visible.sync="showAlterDialog" width="30%" @close="resetDialog">
      <!-- 表单区域 -->
      <span>
        <el-form :model="alterRoleFrom" :rules="RoleFromRules" ref="alterRoleFromRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="alterRoleFrom.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="alterRoleFrom.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAlterDialog = false">取 消</el-button>
        <el-button type="primary" @click="alterRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList() // 获取角色信息
  },
  data() {
    return {
      showAlterDialog: false, // 控制修改角色信息对话框的显示与隐藏
      showAddDialog: false, // 控制添加角色的对话框显示与隐藏
      roleList: [], // 角色信息
      // 添加角色 Dialog 信息
      addRoleFrom: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色的信息
      alterRoleFrom: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      // 添加表单验证规则对象(添加角色))
      RoleFromRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取所有角色的列表
    getRolesList() {
      const res = this.$http.get('roles')
      res.then(val => {
        console.log(val)
        if (val.data.meta.status !== 200) {
          return this.Message.error('请求角色列表信息失败')
        }
        this.roleList = val.data.data
      })
    },
    // 监听 Dialog 关闭事件，退出添加角色 Dialog 并重置表单
    resetDialog () {
      try {
        this.$refs.addRoleFromRef.resetFields()
      } catch (error) {
        console.log(error, 'addRoleFromRef 未被渲染(添加用户的 Dialog 未被渲染)')
      }
      try {
        this.$refs.alterRoleFromRef.resetFields()
      } catch (error) {
        console.log(error, 'alterRoleFromRef 未被渲染(添加用户的 Dialog 未被渲染)')
      }
    },
    // 表单预验证，点击按钮添加新用户
    addRoles () {
      this.$refs.addRoleFromRef.validate(valid => {
        console.log(valid)
        if (!valid) return
        const res = this.$http.post('roles', this.addRoleFrom)
        res.then(val => {
          console.log(val)
          if (val.data.meta.status !== 201) {
            return this.Message.error('添加角色失败')
          }
          this.Message.success('添加角色成功')
          this.showAddDialog = false
          this.getRolesList()
        })
      })
    },
    // 点击按钮删除角色
    async deleteRole (id) {
      console.log(id)
      // 提示确认删除对话框
      const confirmRes = await this.$confirm('此操作将永久删除该用户，是否继续该操作?', '提示', {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.Message.error('删除角色失败')
      this.Message.success('删除用户成功')
      this.getRolesList()
    },
    // 修改角色信息对话框
    alterRoleInfoDialog (val) {
      this.showAlterDialog = true
      // 对应的重置值，只能对应着属性名写，否则将出现bug
      this.alterRoleFrom.id = val.id
      this.alterRoleFrom.roleName = val.roleName
      this.alterRoleFrom.roleDesc = val.roleDesc
    },
    // 表单预验证，获取修改后的角色信息
    alterRoleInfo (a) {
      console.log(a)
      this.$refs.alterRoleFromRef.validate(valid => {
        console.log(valid) // 返回布尔值，预验证是否通过
        if (!valid) return
        console.log(this.alterRoleFrom)
        const res = this.$http.put('roles/' + this.alterRoleFrom.id, {
          roleName: this.alterRoleFrom.roleName,
          roleDesc: this.alterRoleFrom.roleDesc
        })
        res.then(val => {
          console.log(val)
          if (val.data.meta.status !== 200) {
            return this.Message.error('修改角色信息失败')
          }
          this.Message.success('修改角色信息成功')
          this.showAlterDialog = false
          this.getRolesList()
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.box-card {
  margin-top: 15px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2) !important;
  .el-table {
    margin-top: 15px;
  }
}

.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.el-row{
  display: flex;
  align-items: center;
}

.arrange{
  display: flex;
  flex-direction: row;
}
</style>
