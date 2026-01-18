/**
 * 测试数据生成工具
 * 用于演示月视图功能
 */

import type { Task, CheckInRecord } from '@/types'

/**
 * 创建测试任务
 */
export function createTestTasks(): Task[] {
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const thirtyDaysAgo = now - 30 * oneDayMs
  const sixtyDaysFromNow = now + 60 * oneDayMs

  return [
    {
      id: '1',
      name: '每日早起',
      type: 'DO_WANT',
      isEnabled: true,
      startDate: thirtyDaysAgo,
      endDate: sixtyDaysFromNow,
      periodType: 'DAILY',
      targetCompletion: 30
    },
    {
      id: '2',
      name: '禁烟',
      type: 'DONT_WANT',
      isEnabled: true,
      startDate: thirtyDaysAgo,
      endDate: sixtyDaysFromNow,
      periodType: 'DAILY'
    },
    {
      id: '3',
      name: '每日运动',
      type: 'DO_WANT',
      isEnabled: true,
      startDate: thirtyDaysAgo + 7 * oneDayMs, // 从7天前开始
      endDate: sixtyDaysFromNow,
      periodType: 'DAILY',
      targetCompletion: 25
    },
    {
      id: '4',
      name: '减少甜食',
      type: 'DONT_WANT',
      isEnabled: true,
      startDate: now - 15 * oneDayMs, // 从15天前开始
      endDate: sixtyDaysFromNow,
      periodType: 'DAILY'
    },
    {
      id: '5',
      name: '每日阅读',
      type: 'DO_WANT',
      isEnabled: true,
      startDate: now - 10 * oneDayMs, // 从10天前开始
      endDate: sixtyDaysFromNow,
      periodType: 'DAILY',
      targetCompletion: 20
    }
  ]
}

/**
 * 创建测试打卡记录（模拟成功记录）
 */
export function createTestCheckInRecords(): CheckInRecord[] {
  const records: CheckInRecord[] = []
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000

  // 任务1：每日早起（大部分成功）
  for (let i = 0; i < 25; i++) {
    const dateKey = getDateKeyFromOffset(now, -i)
    records.push({
      id: `checkin-1-${i}`,
      taskId: '1',
      timestamp: now - i * oneDayMs,
      isCompleted: Math.random() > 0.2, // 80%成功率
      dateKey
    })
  }

  // 任务3：每日运动（中等成功率）
  for (let i = 0; i < 18; i++) {
    const dateKey = getDateKeyFromOffset(now, -i - 7) // 从7天前开始
    records.push({
      id: `checkin-3-${i}`,
      taskId: '3',
      timestamp: now - (i + 7) * oneDayMs,
      isCompleted: Math.random() > 0.4, // 60%成功率
      dateKey
    })
  }

  // 任务5：每日阅读（高成功率）
  for (let i = 0; i < 8; i++) {
    const dateKey = getDateKeyFromOffset(now, -i - 10) // 从10天前开始
    records.push({
      id: `checkin-5-${i}`,
      taskId: '5',
      timestamp: now - (i + 10) * oneDayMs,
      isCompleted: Math.random() > 0.1, // 90%成功率
      dateKey
    })
  }

  return records
}

/**
 * 从偏移量获取日期键
 */
function getDateKeyFromOffset(baseTimestamp: number, dayOffset: number): string {
  const date = new Date(baseTimestamp + dayOffset * 24 * 60 * 60 * 1000)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 生成演示用的状态统计
 */
export function getDemoStats() {
  return {
    totalTasks: 5,
    activeTasks: 5,
    completedTasks: 0,
    currentStreak: 12,
    successRate: 75
  }
}
