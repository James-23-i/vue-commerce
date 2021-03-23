import { request } from './request'
export function getGoodsList(query, pagenum, pagesize) {
  return request({
    url: 'goods',
    params: {
      query,
      pagenum,
      pagesize
    }
  })
}

export function queryGoodsById(id) {
  return request({
    url: `goods/${id}`
  })
}

export function editGoodsById(id, {...args}) {
  return request({
    url: `goods/${id}`,
    method: 'put',
    data: {
      ...args
    }
  })
}

export function deleteGoods(id) {
  return request({
    url: `goods/${id}`,
    method: 'delete'
  })
}

// 当调用的函数参入有个参数运用 rest运算符，用于解构数组或者对象
export function addGoods({...args}) {
  return request({
    url: 'goods',
    method: 'post',
    data: {
      ...args
    }
  })
}