import { request } from './request'
export function getLogin(username, password) {
  return request({
    url: 'login',
    // post和其他请求对应参数的属性为data, 而get请求为params
    // method: 'post',
    params: {
      username,
      password
    }
  })
}