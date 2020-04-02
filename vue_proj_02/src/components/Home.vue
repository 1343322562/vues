<template>
  <el-container class="home_container">
    <el-header>
      <div class="header_left">
        <img src="../assets/heima.png" alt="#" />
        <span>电商后台管理系统</span>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          :collapse-transition="delColTransition"
          router
        >
        <!-- default-active为初始路由  -->
        <!-- collapse为控制侧边栏折叠  -->
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" style="padding-left:70px">
              <template slot="title">
                <i class="el-icon-s-operation"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>

        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [], // 侧边栏数据表单
      isCollapse: false, // 控制侧边栏折叠
      delColTransition: false // 取消侧边栏动画效果，主要是因为动画难看
    }
  },
  created () {
    console.log('history route:', this.$route)
    this.getMenuList() // 获取侧边栏菜单数据
  },
  methods: {
    // 获取侧边栏数据
    getMenuList () {
      const res = this.$http.get('menus')
      res.then(val => {
        console.log(val)
        if (val.status !== 200) return this.Message.error(val.data.meta.msg)
        this.menulist = val.data.data
        console.log('data:', val.data.data)
      })
    },
    // 侧边栏折叠
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang='less' scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  .header_left {
    display: flex;
    align-items: center;

    span {
      color: #fff;
      font-size: 20px;
      padding-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu{
    border-right: 0;
  }
}

.el-main {
  background-color: #eaedf1;
}

.toggle-button {
  color: #fff;
  line-height: 25px;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  background-color: #545c64;
  letter-spacing: .2em;
}
.toggle-button:hover{
  background-color: #333744;
}
</style>
