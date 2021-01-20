// pages/type/type.js
import api from '../../utils/api'
import config from '../../utils/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: []
  },
  async onLoad() {
    let res = await api._findall(config.tables.typeTable)
    res.data.map((item, index) => {
      item.src = "../../imgs/index_05.jpg"
    })
    this.setData({
      types: res.data
    })
  },
  _toTypeDetail(e) {
    let {
      tag,
      id,
      title
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../list/list?id=' + id + "&title=" + title + "&tag=" + tag,
    })
  }
})