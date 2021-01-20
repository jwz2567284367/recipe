// pages/category/category.js
import api from "../../utils/api"
// console.log(api);
import config from "../../utils/config"
Page({
  data: {
    addVal: "",
    types: [],
  
  },
  onLoad() {
    this._getTypeName()
  },
  // 添加类别
  async _addType() {
    let typeName = this.data.addVal
    console.log(typeName);
    let types = this.data.types
    let indent = types.findIndex(item => {
      return item.typeName == typeName
    })
    if (indent != -1) {
      wx.showToast({
        title: '当前类别已存在',
        icon: "none"
      })
      return
    }
    let res = await api._add(config.tables.typeTable, {
      typeName
    })
    console.log(res);
    if (res._id) {
      wx.showToast({
        title: '添加成功',
      })
    }
    this._getTypeName()
  },
  // 获取类别
  async _getTypeName() {
    let res = await api._findall(config.tables.typeTable)
    // console.log(res)
    this.setData({
      types: res.data
    })
  },
  // 删除类别
  async _delType(e) {
    let id = e.target.dataset.id
    // console.log(id);
    let res = await api._delById(config.tables.typeTable, id)
    // console.log(res);
    if (res.stats.removed == 1) {
      wx.showToast({
        title: '删除成功',
      })
    }
    this._getTypeName()
  },
  // 修改类别
  async _updType(e) {
    let index = e.target.dataset.index
    let type = this.data.types[index]
    this.setData({
      updVal: type.typeName,
      id: type._id
    })
  },
async  _doUpdType(){
    let {updVal,id}=this.data
     let res=await api._updById(config.tables.typeTable,id,{typeName:updVal})
     console.log(res);
     if(res.stats==1){
       this._getTypeName()
     }
  }
})