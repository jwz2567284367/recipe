// 数据操作
let db = wx.cloud.database()

// 查询
const _findById = (cname,id) => {
return db.collection(cname).doc(id).get()
}
// 查询并排序和分页
const _findByPage = (cname,where={},page=1,limit=4,orderBy={field:"id",sort:"desc"},) => {
  let skip=(page-1)*limit  //跳过多少条
return db.collection(cname).where(where).orderBy(orderBy.field,orderBy.sort).skip(skip).limit(limit).get()
}
//查询所有
const _findall = async (cname, where = {},orderBy={field:"id",sort:"desc"}) => {
  //  return db.collection(cname).where({where}).get()
  const MAX_LIMIT = 20
  // 先取出集合记录总数
  const countResult = await db.collection(cname).where(where).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  let tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(cname).where(where).orderBy(orderBy.field,orderBy.sort).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  tasks = await Promise.all(tasks)
  // console.log(tasks);
  if (tasks.length <= 0) return null
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),

    }
  })
}
// 添加类别
const _add = (cname, data = {}) => {
  return db.collection(cname).add({
    data
  })
}
// 删除类别
const _delById = (cname, id = "") => {
  return db.collection(cname).doc(id).remove()
}
// 修改类别
const _updById = (cname, id = "", data) => {
  return db.collection(cname).doc(id).update({
    data
  })
}
export default {
  _findById,
  _findall,
  _add,
  _delById,
  _updById,
  _findByPage,
  db,
}