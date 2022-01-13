import { request } from './request'
export function queryOrdersData({...args}) {
  return request({
    url: 'orders',
    params: {
      ...args
    }
  })
}

export function addOrdersData({...args}) {
  return request({
    url: 'orders',
    method: 'post',
    data: {
      ...args
    }
  })
}

export function detailOrdersData(id) {
  return request({
    url: `orders/${id}`,
  })
}

export function editOrdersData(id, params) {
  return request({
    url: `orders/${id}`,
    method: 'put',
    data: {
      ...params
    }
  })
}
