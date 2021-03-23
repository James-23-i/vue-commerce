import { request } from './request'
export function getRightsData() {
  return request({
    url: 'rights/list'
  })
}

export function getRolesData() {
  return request({
    url: 'roles'
  })
}

export function addRolesData(roleName, roleDesc) {
  return request({
    url: 'roles',
    method: 'post',
    data: {
      roleName,
      roleDesc
    }
  })
}

export function editInputData(id) {
  return request({
    url: `roles/${id}`
  })
}

export function editRolesData(id, roleName, roleDesc) {
  return request({
    url: `roles/${id}`,
    method: 'put',
    data: {
      roleName,
      roleDesc
    }
  })
}

export function delRolesData(id) {
  return request({
    url: `roles/${id}`,
    method: 'delete'
  })
}

export function delRights(roleId, rightId) {
  return request({
    url: `roles/${roleId}/rights/${rightId}`,
    method: 'delete'
  })
}

export function getTreeRights() {
  return request({
    url: 'rights/tree'
  })
}

export function alloRights(roleId, rids) {
  return request({
    url: `roles/${roleId}/rights`,
    method: 'post',
    data: {
      rids
    }
  })
}