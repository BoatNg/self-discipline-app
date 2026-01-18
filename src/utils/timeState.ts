import { generateDateKey } from './streakCalculator'

export type TimeState = 'PAST' | 'TODAY' | 'FUTURE'

/**
 * 获取指定日期的日期态（相对于参考日期）
 * @param date 要判断的日期
 * @param referenceDate 参考日期，默认为今天
 * @returns 日期态：PAST(过去)、TODAY(今天)、FUTURE(未来)
 */
export function getTimeState(date: Date, referenceDate: Date = new Date()): TimeState {
  const dateKey = generateDateKey(date)
  const referenceKey = generateDateKey(referenceDate)

  if (dateKey < referenceKey) return 'PAST'
  if (dateKey === referenceKey) return 'TODAY'
  return 'FUTURE'
}

/**
 * 判断日期是否为过去
 */
export function isPastDate(date: Date, referenceDate: Date = new Date()): boolean {
  return getTimeState(date, referenceDate) === 'PAST'
}

/**
 * 判断日期是否为今天
 */
export function isTodayDate(date: Date, referenceDate: Date = new Date()): boolean {
  return getTimeState(date, referenceDate) === 'TODAY'
}

/**
 * 判断日期是否为未来
 */
export function isFutureDate(date: Date, referenceDate: Date = new Date()): boolean {
  return getTimeState(date, referenceDate) === 'FUTURE'
}
