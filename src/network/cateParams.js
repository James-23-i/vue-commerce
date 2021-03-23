import { request } from './request'
export function getCascaderData() {
  return request({
    url: 'categories'
  })
}

export function getCateParams(id, sel) {
  return request({
    url: `categories/${id}/attributes`,
    params: {
      sel
    }
  })
}

export function addParams(id, attr_name, attr_sel) {
  return request({
    url: `categories/${id}/attributes`,
    method: 'post',
    data: {
      attr_name,
      attr_sel
    }
  })
}

export function queryParamsById(id, attrId, attr_sel) {
  return request({
    url: `categories/${id}/attributes/${attrId}`,
    params: {
      attr_sel
    }
  })
}

export function editParams(id, attrId, attr_name, attr_sel, attr_vals) {
  return request({
    url: `categories/${id}/attributes/${attrId}`,
    method: 'put',
    data: {
      attr_name,
      attr_sel,
      attr_vals
    }
  })
}

export function deleteParams(id, attrId) {
  return request({
    url: `categories/${id}/attributes/${attrId}`,
    method: 'delete'
  })
}