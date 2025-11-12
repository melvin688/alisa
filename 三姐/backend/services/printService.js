/**
 * 打印服务 - 支持USB小票打印机
 * 使用ESC/POS协议,兼容芯烨/佳博等品牌打印机
 */

const { formatReceiptTime } = require('../utils/timezone');

class PrintService {
  /**
   * 格式化缅甸时间
   * @param {String} datetime - 时间字符串
   * @returns {String} - 格式化的缅甸时间
   */
  static formatMyanmarTime(datetime) {
    // 使用统一的时区工具
    if (!datetime) return formatReceiptTime();
    return formatReceiptTime(new Date(datetime));
  }

  /**
   * 生成小票打印内容 (ESC/POS格式)
   * @param {Object} order - 订单对象
   * @returns {String} - 打印内容(纯文本)
   */
  static generateReceipt(order) {
    const lines = [];
    const width = 32; // 58mm纸张约32字符宽

    // 标题
    lines.push(this.centerText('============================', width));
    lines.push(this.centerText('*** Alisa Cake ***', width));
    lines.push(this.centerText('============================', width));
    lines.push('');
    lines.push(this.centerText('订单小票 / ORDER RECEIPT', width));
    lines.push(this.separator(width));

    // 订单信息
    lines.push(`订单号: ${order.order_no}`);
    lines.push(`Order: ${order.order_no}`);
    lines.push(`桌号/Table: ${order.table_number}`);
    lines.push(`时间/Time: ${this.formatMyanmarTime(order.created_at)}`);
    lines.push(this.separator(width));

    // 商品列表
    lines.push('商品明细 / Items:');
    lines.push('');
    
    order.items.forEach((item, index) => {
      // 商品名称
      lines.push(`${index + 1}. ${item.product_name}`);
      
      // 规格信息
      if (item.options && item.options.length > 0) {
        const optionsText = item.options.map(opt => opt.name_zh || opt.name).join(', ');
        lines.push(`   (${optionsText})`);
      }
      
      // 数量和价格
      const itemLine = `   x${item.quantity}`.padEnd(10) + 
                       `¥${(item.unit_price * item.quantity).toFixed(0)} MMK`.padStart(width - 10);
      lines.push(itemLine);
      lines.push('');
    });

    lines.push(this.separator(width));

    // 合计
    const totalLine = `总计 / Total:`.padEnd(15) + 
                     `¥${order.total_amount.toFixed(0)} MMK`.padStart(width - 15);
    lines.push(totalLine);
    lines.push(this.separator(width));

    // 备注
    if (order.remark) {
      lines.push(`备注 / Note: ${order.remark}`);
      lines.push(this.separator(width));
    }

    // 结尾
    lines.push('');
    lines.push(this.centerText('谢谢惠顾!', width));
    lines.push(this.centerText('Thank You!', width));
    lines.push('');
    lines.push('');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 生成后厨打印内容 (简化版)
   * @param {Object} order - 订单对象
   * @returns {String} - 打印内容
   */
  static generateKitchenReceipt(order) {
    const lines = [];
    const width = 32;

    // 标题
    lines.push(this.centerText('============================', width));
    lines.push(this.centerText('*** Alisa Cake ***', width));
    lines.push(this.centerText('============================', width));
    lines.push('');
    lines.push(this.centerText('后厨订单 / KITCHEN ORDER', width));
    lines.push(this.separator(width, '='));

    // 订单信息
    lines.push('');
    lines.push(`桌号: ${order.table_number}`.padEnd(width / 2) + `时间: ${moment(order.created_at).tz('Asia/Yangon').format('HH:mm')}`);
    lines.push(`订单: ${order.order_no}`);
    lines.push('');
    lines.push(this.separator(width, '='));

    // 商品列表 (突出显示)
    order.items.forEach((item) => {
      lines.push('');
      lines.push(`▶ ${item.product_name} x${item.quantity}`);
      
      // 规格信息
      if (item.options && item.options.length > 0) {
        item.options.forEach(opt => {
          lines.push(`  - ${opt.name_zh || opt.name}`);
        });
      }
    });

    lines.push('');
    lines.push(this.separator(width, '='));

    // 备注 (重点提醒)
    if (order.remark) {
      lines.push('');
      lines.push('!!! 备注 !!!');
      lines.push(order.remark);
      lines.push('');
    }

    lines.push('');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 生成HTML格式小票 (用于浏览器打印预览)
   * @param {Object} order - 订单对象
   * @returns {String} - HTML内容
   */
  static generateHTMLReceipt(order) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { 
      size: 80mm auto; 
      margin: 0; 
    }
    body { 
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 80mm;
      margin: 0;
      padding: 5mm;
      line-height: 1.4;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; font-size: 14px; }
    .store-name { 
      font-size: 18px; 
      font-weight: bold; 
      text-align: center; 
      margin: 10px 0;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 8px 0;
    }
    .line { border-bottom: 1px dashed #000; margin: 5px 0; }
    .item { margin: 8px 0; }
    .item-name { font-weight: bold; }
    .item-options { font-size: 11px; color: #666; margin-left: 10px; }
    .item-price { display: flex; justify-content: space-between; margin-left: 10px; }
    .total { font-size: 16px; font-weight: bold; }
    .footer { margin-top: 10px; }
  </style>
</head>
<body>
  <div class="store-name">*** Alisa Cake ***</div>
  <div class="center bold">订单小票 / ORDER RECEIPT</div>
  <div class="line"></div>
  
  <div>订单号: ${order.order_no}</div>
  <div>Order: ${order.order_no}</div>
  <div>桌号/Table: ${order.table_number}</div>
  <div>时间/Time: ${moment(order.created_at).format('YYYY-MM-DD HH:mm')}</div>
  <div class="line"></div>
  
  <div class="bold">商品明细 / Items:</div>
  ${order.items.map((item, index) => `
    <div class="item">
      <div class="item-name">${index + 1}. ${item.product_name}</div>
      ${item.options && item.options.length > 0 ? `
        <div class="item-options">(${item.options.map(opt => opt.name_zh || opt.name).join(', ')})</div>
      ` : ''}
      <div class="item-price">
        <span>x${item.quantity}</span>
        <span>¥${(item.unit_price * item.quantity).toFixed(0)} MMK</span>
      </div>
    </div>
  `).join('')}
  
  <div class="line"></div>
  <div class="item-price total">
    <span>总计 / Total:</span>
    <span>¥${order.total_amount.toFixed(0)} MMK</span>
  </div>
  <div class="line"></div>
  
  ${order.remark ? `
    <div>备注 / Note: ${order.remark}</div>
    <div class="line"></div>
  ` : ''}
  
  <div class="footer center">
    <div>谢谢惠顾!</div>
    <div>Thank You!</div>
  </div>
</body>
</html>
    `;
  }

  /**
   * 居中文本
   */
  static centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  /**
   * 生成分隔线
   */
  static separator(width, char = '-') {
    return char.repeat(width);
  }

  /**
   * 通过浏览器打印API打印
   * @param {String} html - HTML内容
   */
  static printViaWindow(html) {
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    };
  }
}

module.exports = PrintService;
