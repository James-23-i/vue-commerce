import { request } from './request'
export function getCategoryData(type, pagenum, pagesize) {
  return request({
    url: 'categories',
    params: {
      type,
      pagenum,
      pagesize
    }
  })
}

export function addCategories(cat_pid, cat_name, cat_level) {
  return request({
    url: 'categories',
    method: 'post',
    data: {
      cat_pid,
      cat_name,
      cat_level
    }
  })
}

export function queryCateId(id) {
  return request({
    url: `categories/${id}`
  })
}

export function editCateById(id, cat_name) {
  return request({
    url: `categories/${id}`,
    method: 'put',
    data: {
      cat_name
    }
  })
}

export function deleteCateById(id) {
  return request({
    url: `categories/${id}`,
    method: 'delete'
  })
}

