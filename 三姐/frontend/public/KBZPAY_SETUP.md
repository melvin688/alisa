# KBZPay 收款码使用说明

## 如何添加收款码图片

1. 将你的KBZPay收款码图片保存为 `kbzpay-qr.jpg` 或 `kbzpay-qr.png`

2. 将图片复制到以下位置：
   ```
   frontend/public/kbzpay-qr.jpg
   ```

3. 或者上传到图床（如 Imgur），然后修改 `Payment.vue` 中的图片路径

## 当前配置

- 账户名称：Nu Nu Khaung(******0500)
- 收款码位置：需要手动添加图片

## 修改图片路径

在 `frontend/src/views/Payment.vue` 中找到：
```vue
<img 
  src="https://i.imgur.com/your-uploaded-qr-code.jpg" 
  alt="KBZPay QR Code"
/>
```

改为：
```vue
<img 
  src="/kbzpay-qr.jpg" 
  alt="KBZPay QR Code"
/>
```
