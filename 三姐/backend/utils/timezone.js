/**
 * 缅甸时区时间处理工具
 * 缅甸时区: UTC+6:30 (Asia/Yangon)
 */

const MYANMAR_OFFSET_HOURS = 6;
const MYANMAR_OFFSET_MINUTES = 30;
const MYANMAR_OFFSET_MS = (MYANMAR_OFFSET_HOURS * 60 + MYANMAR_OFFSET_MINUTES) * 60 * 1000;

/**
 * 获取当前缅甸时间
 * @returns {Date} 缅甸时区的当前时间
 */
function getMyanmarTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + MYANMAR_OFFSET_MS);
}

/**
 * 格式化为 MySQL DATETIME 格式 (YYYY-MM-DD HH:MM:SS)
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期时间字符串
 */
function formatDateTime(date) {
  if (!date) date = getMyanmarTime();
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化为日期格式 (YYYY-MM-DD)
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  if (!date) date = getMyanmarTime();
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 格式化为时间格式 (HH:MM:SS)
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date) {
  if (!date) date = getMyanmarTime();
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化为小票时间格式 (YYYY-MM-DD HH:MM)
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间字符串
 */
function formatReceiptTime(date) {
  if (!date) date = getMyanmarTime();
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 将字符串或Date转换为缅甸时区时间
 * @param {string|Date} input - 输入的日期时间
 * @returns {Date} 缅甸时区时间
 */
function toMyanmarTime(input) {
  let date;
  if (typeof input === 'string') {
    date = new Date(input);
  } else if (input instanceof Date) {
    date = input;
  } else {
    return getMyanmarTime();
  }
  
  // 如果输入的是UTC时间，转换为缅甸时区
  const utc = date.getTime();
  return new Date(utc + MYANMAR_OFFSET_MS);
}

/**
 * 获取今天的日期范围（缅甸时区）
 * @returns {Object} { start: Date, end: Date }
 */
function getTodayRange() {
  const now = getMyanmarTime();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * 检查日期是否为今天（缅甸时区）
 * @param {string|Date} dateInput - 要检查的日期
 * @returns {boolean}
 */
function isToday(dateInput) {
  const inputDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const today = getMyanmarTime();
  
  return inputDate.getFullYear() === today.getFullYear() &&
         inputDate.getMonth() === today.getMonth() &&
         inputDate.getDate() === today.getDate();
}

/**
 * 生成订单号（基于缅甸时间）
 * @param {string} prefix - 前缀，默认 'ORD'
 * @returns {string} 订单号
 */
function generateOrderNo(prefix = 'ORD') {
  const now = getMyanmarTime();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `${prefix}${year}${month}${day}${hours}${minutes}${seconds}${ms}${random}`;
}

module.exports = {
  getMyanmarTime,
  formatDateTime,
  formatDate,
  formatTime,
  formatReceiptTime,
  toMyanmarTime,
  getTodayRange,
  isToday,
  generateOrderNo,
  MYANMAR_OFFSET_HOURS,
  MYANMAR_OFFSET_MINUTES,
  MYANMAR_OFFSET_MS
};
