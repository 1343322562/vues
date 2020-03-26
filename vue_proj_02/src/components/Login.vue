<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 登录头像  -->
      <div class="logo_box">
        <img class="login_logo" src="../assets/logo.png" />
      </div>
      <!-- 表单区域 -->
      <el-form
        ref="LoginFormRef"
        :model="loginFrom"
        :rules="loginFromRules"
        class="login_form"
        label-width="0"
      >
        <el-form-item prop="username">
          <el-input
            type="text"
            v-model="loginFrom.username"
            prefix-icon="el-icon-user-solid"
            style="ime-mode:disabled"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginFrom.password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-row>
          <el-button type="primary" @click="validaForm">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-row>
      </el-form>
      <!-- <div class="user_info">
        <div class="name"></div>
        <div class="password"></div>
      </div>-->
    </div>

    <!-- 登录时的加载动画 -->
    <div class='loading_box' v-if="loading_wait">
      <div class='loading'>
        <span></span>
        <div style="height:20px;color:#fff;padding:10px;display:block">加载中......</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 表单的数据对象
      loginFrom: {
        username: '',
        password: ''
      },
      // 表单验证
      loginFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 15, message: '长度在 4 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 15, message: '长度在 4 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 加载动画
      loading_wait: false
    }
  },
  methods: {
    resetForm () {
      // 重置表单
      this.$refs.LoginFormRef.resetFields()
    },
    validaForm () {
      // 表单验证
      this.$refs.LoginFormRef.validate(valid => {
        console.log(valid)
        if (!valid) return alert('请输入合法的用户名或密码')
        this.loading_wait = true
        // 判断登录是否成功
        const loginRes = this.$http.post('login', this.loginFrom)
        loginRes.then(val => {
          if (val.data.meta.status === 400) {
            this.Message.error(val.data.meta.msg)
            this.loading_wait = false
            this.resetForm()
          }
          if (val.data.meta.status === 200) {
            this.Message.success(val.data.meta.msg)
            // 登录成功，储存 token , token的sessionStorage 只会在当前页面生效
            window.sessionStorage.setItem('token', val.data.token)
            this.$router.push('/home') // 函数式 跳转至 /home 页面
          }
        })
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang = 'less' scoped>
.login_container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #2b4b6b;
}

.login_box {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
}

.logo_box {
  position: absolute;
  top: -75px;
  height: 130px;
  width: 130px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  background-color: #fff;
  .login_logo {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    border-radius: 50%;
    background-color: #eee;
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px 40px 20px;
  box-sizing: border-box;
}

.loading_box {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  .loading{
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }
  span {
    box-shadow: 0 0 10px rgb(88, 172, 150);
    display: block;
    height: 2.2em;
    width: 2.2em;
    text-align: center;
    border: 3px solid #45ffeb;
    position: relative;
    animation: rotateSquare 2.3s ease-in-out infinite;
  }
  @keyframes rotateSquare {
    0% {
      transform: rotate(0deg);
    }
    60% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  span::after {
    transform-origin: center bottom;
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgb(88, 172, 163);
    opacity: 0.5;
    animation: rotateSquareInset 2.3s ease-in-out infinite;
  }
  @keyframes rotateSquareInset {
    0% {
      transform: scaleY(1);
    }
    30% {
      transform: scaleY(0);
    }
    65% {
      transform: scaleY(0);
    }
    90% {
      transform: scaleY(1);
    }
    100% {
      transform: scaleY(1);
    }
  }
}
</style>
