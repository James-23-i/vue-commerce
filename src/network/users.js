import { request } from './request'
export function getUserData(query, pagenum, pagesize) {
  return request({
    url: 'users',
    params: {
        query,
        pagenum,
        pagesize
    }
  })
}

export function changeState(uId, type) {
  return request({
    url: `users/${uId}/state/${type}`,
    method: 'put'
  })
}

export function addUserInfo(username, password, email, mobile) {
  return request({
    url: 'users',
    method: 'post',
    data: {
      username,
      password,
      email,
      mobile
    }
  })
}

export function altUserInfo(id) {
  return request({
    url: `users/${id}`,
  })
}

export function submitEdit(id, email, mobile) {
  return request({
    url: `users/${id}`,
    method: 'put',
    data: {
      email,
      mobile
    }
  })
}

export function delUserInfo(id) {
  return request({
    url: `users/${id}`,
    method: 'delete'
  })
}

export function getRolesData() {
  return request({
    url: 'roles'
  })
}

export function allotUser(id, rid) {
  return request({
    url: `users/${id}/role`,
    method: 'put',
    data: {
      rid
    }
  })
}