// 修复localstorage.json中的任务时间问题
// 将任务的startDate和endDate调整为本地时间的00:00:00

const fs = require('fs')
const path = require('path')

// 读取localstorage.json
const filePath = path.join(__dirname, 'localstorage.json')
console.log('读取文件:', filePath)

try {
  const data = fs.readFileSync(filePath, 'utf8')
  const storage = JSON.parse(data)

  console.log('原始数据:')
  console.log('- 任务数量:', storage.tasks.length)
  console.log('- 日志数量:', storage.urgeLogs.length)

  // 修复任务开始和结束时间
  storage.tasks.forEach((task, index) => {
    console.log(`\n任务 ${index + 1}: ${task.name}`)
    console.log('原始开始时间:', task.startDate, '=', new Date(task.startDate).toLocaleString())
    console.log('原始结束时间:', task.endDate, '=', new Date(task.endDate).toLocaleString())

    // 将开始时间调整为当天的00:00:00本地时间
    const startDate = new Date(task.startDate)
    startDate.setHours(0, 0, 0, 0)
    task.startDate = startDate.getTime()

    // 将结束时间调整为当天的23:59:59.999本地时间
    const endDate = new Date(task.endDate)
    endDate.setHours(23, 59, 59, 999)
    task.endDate = endDate.getTime()

    console.log('修复后开始时间:', task.startDate, '=', new Date(task.startDate).toLocaleString())
    console.log('修复后结束时间:', task.endDate, '=', new Date(task.endDate).toLocaleString())
  })

  // 修复日志时间戳（如果需要）
  console.log('\n=== 修复日志时间戳 ===')
  storage.urgeLogs.forEach((log, index) => {
    if (index < 5) {
      // 只显示前5条
      console.log(`日志 ${index + 1}:`, new Date(log.timestamp).toLocaleString())
    }
    // 日志时间戳保持原样，因为它们应该是用户实际操作的时间
  })

  // 保存修复后的数据
  const backupPath = path.join(__dirname, 'localstorage-backup.json')
  fs.writeFileSync(backupPath, data, 'utf8')
  console.log('\n原始数据已备份到:', backupPath)

  // 保存修复后的数据
  fs.writeFileSync(filePath, JSON.stringify(storage, null, 2), 'utf8')
  console.log('修复后的数据已保存到:', filePath)

  console.log('\n=== 验证修复 ===')
  const task = storage.tasks[1] // "每天读书30分钟"
  const date17 = new Date(2026, 0, 17, 0, 0, 0, 0) // 2026-01-17 00:00:00
  date17.setHours(0, 0, 0, 0)
  const date17Timestamp = date17.getTime()

  console.log('任务开始时间:', task.startDate, '=', new Date(task.startDate).toLocaleString())
  console.log('17号时间戳:', date17Timestamp, '=', new Date(date17Timestamp).toLocaleString())
  console.log('比较: date17Timestamp >= task.startDate?', date17Timestamp >= task.startDate)

  if (date17Timestamp >= task.startDate) {
    console.log('✅ 修复成功：17号在任务开始时间之后')
  } else {
    console.log('❌ 修复失败：17号仍在任务开始时间之前')
  }
} catch (error) {
  console.error('修复失败:', error.message)
}
