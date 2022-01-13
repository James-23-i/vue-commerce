// 导出Excel
import moment from 'moment'
export default function exportExcel(columns, list, excelName) {
  require.ensure([], () => {
    const { export_json_to_excel } = require('../vender/Export2Excel');//注意引入资源路径问题（我这里是相对路径）
    let tHeader = []
    let filterVal = []
    columns.forEach(item => {
      tHeader.push(item.title)
      filterVal.push(item.key)
    })
    let data = list.map(v => filterVal.map(j => v[j]))
    export_json_to_excel(tHeader, data, excelName);
  })
}