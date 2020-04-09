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
      <!-- 搜索框区域 -->
      <el-row>
        <el-col :span="8">
          <el-input clearable @clear="1+1" placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="1+1"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="200"></el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)" width="200"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="200">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag v-else type="warning">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="200"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200">
          <template slot-scope="scope">
            {{scope.row.create_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="addressBox">编辑地址</el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox">物流进度</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    </el-card>
    <!-- 编辑信息 Dialog (修改地址)-->
    <el-dialog
        title="填写地址"
        :visible.sync="alterDialogVisible"
        width="30%">
      <!-- 表单区域 -->
      <el-form :model="alterForm" :rules="alterFormRules" ref="alterFormRef" label-width="100px" @close="resetForm">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="alterForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="alterForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alterDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressValid">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度  Dialog-->
    <el-dialog
        title="物流信息"
        :visible.sync="progressDialogVisible"
        width="30%">
      <el-timeline>
        <el-timeline-item
        v-for="(activity, index) in progressInfo"
        :key="index"
        :timestamp="activity.time">
        {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0, // 订单总数
      orderList: [], // 订单数据源
      alterDialogVisible: false, // 控制修改信息对话框的显示与隐藏
      // 修改信息表单数据对象
      alterForm: {
        address1: [], // 选择的地址，级联选择，所以为数组
        address2: '' // 详细地址
      },
      // 表单验证规则
      alterFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 引入省市区/县
      cityData,
      progressDialogVisible: false, // 控制物流信息对话框显示隐藏
      // 物流信息数据对象
      progressInfo: {}
    }
  },
  created () {
    this.getOrderList() // 获取订单数据
  },
  methods: {
    // 获取订单数据
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.Message.error('订单信息获取失败')
      console.log(res.data)
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    // 监听当前页面显示数量的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听当前所在页码的改变
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 点击打开编辑订单信息(地址)
    addressBox () {
      this.alterDialogVisible = true
    },
    // 重置表单
    resetForm () {
      this.$refs.alterFormRef.resetFields()
    },
    // 显示物流进度对话框
    async showProgressBox () {
      const { data: res } = await this.$http.get('kuaidi/804909574412544580+')
      if (res.meta.status !== 200) return this.Message.error('获取物流进度失败')
      this.progressInfo = res.data
      this.progressDialogVisible = true
      console.log(this.progressInfo)
    },
    // 选择地址表单预验证
    addressValid () {
      this.$refs.alterFormRef.validate(valid => {
        if (!valid) return
        this.Message.success('修改成功')
        this.alterDialogVisible = false
      })
    }
  }
}
</script>

<style lang='less' scoped>
// 导入 时间线组件 css 样式表
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item(1).css';
.el-cascader {
  width: 100%;
}

.el-timeline-item{
  margin: 8px 0;
}
</style>
