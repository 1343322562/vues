import Vue from 'vue'
import { Dialog, Pagination, Tooltip, Switch, Button, Select, Input, Form, FormItem, Row, MessageBox, Message, Container, Aside, Main, Header, Menu, MenuItem, MenuItemGroup, Submenu, Breadcrumb, BreadcrumbItem, Card, Col, Table, TableColumn } from 'element-ui'

Vue.use(Switch)
Vue.use(Button)
Vue.use(Select)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Row)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.Message = Message
