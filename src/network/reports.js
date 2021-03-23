import { request } from './request'
export function getTotalData() {
  return request({
    url: 'reports/type/1'
  })
}