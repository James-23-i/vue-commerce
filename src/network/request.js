import axios from 'axios'

export function request(config) {
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8888/api/private/v1/',
    // baseURL: 'http://timemeetyou.com:8889/api/private/v1/',
    timeout: 5000
  })

  instance.interceptors.request.use(config => {
    // 携带token认证，请求头Authorization
    // config.headers.Authorization = window.sessionStorage.getItem('token')
    const token = window.sessionStorage.getItem("token");
    token && (config.headers.Authorization = token);
    return config
  }, err => {
    return err
  })

  instance.interceptors.response.use(res => {
    return res.data
  }, err => {
    if(err && err.response) {
      switch (err.response.status) {
        case 400:
          err.message = '请求错误'
          break
        case 401:
            err.message = '未授权访问'
            break
      }
    }
    return err
  })
  
  return instance(config)
}