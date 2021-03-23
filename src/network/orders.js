import { request } from './request'
export function queryOrdersData({...args}) {
  return request({
    url: 'orders',
    params: {
      ...args
    }
  })
}