<template>
  <div class="home-page">
    <!-- Logo和品牌 -->
    <div class="brand-header">
      <div class="brand-logo">
        <img src="/alisa-logo.jpg" alt="Alisa Cake" class="logo-image" />
      </div>
      <h1 class="brand-name-zh">Alisa Cake</h1>
      <p class="brand-slogan">用心烘焙 · 甜蜜相伴</p>
    </div>

    <!-- 服务选择 -->
    <div class="service-grid">
      <!-- 在店堂食 - 主要入口 -->
      <div class="service-card primary" @click="handleServiceSelect('dine-in')">
        <div class="service-icon">
          <van-icon name="shop-o" size="48" />
        </div>
        <div class="service-text">
          <div class="service-title">在店堂食</div>
          <div class="service-subtitle">自助下单</div>
        </div>
      </div>

      <!-- 外卖配送 -->
      <div class="service-card" @click="handleServiceSelect('delivery')">
        <div class="service-icon">
          <van-icon name="logistics" size="48" />
        </div>
        <div class="service-text">
          <div class="service-title">外卖配送</div>
          <div class="service-subtitle">Delivery</div>
        </div>
      </div>

      <!-- 来店自取 -->
      <div class="service-card" @click="handleServiceSelect('takeaway')">
        <div class="service-icon">
          <van-icon name="bag-o" size="48" />
        </div>
        <div class="service-text">
          <div class="service-title">来店自取</div>
          <div class="service-subtitle">Take away</div>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="function-grid">
      <div class="function-item" @click="goToCustom">
        <van-icon name="gift-o" size="24" />
        <div class="function-text">
          <span class="function-title">定制&教学</span>
          <span class="function-subtitle">Custom & Teaching</span>
        </div>
      </div>

      <div class="function-item" @click="showWifiInfo">
        <van-icon name="wifi-o" size="24" />
        <div class="function-text">
          <span class="function-title">门店WIFI</span>
          <span class="function-subtitle">Store WiFi</span>
        </div>
      </div>
    </div>

    <!-- WiFi信息弹窗 -->
    <van-dialog
      v-model:show="showWifi"
      title="门店WIFI"
      :show-cancel-button="false"
      confirm-button-text="我知道了"
    >
      <div class="wifi-info">
        <div class="wifi-item">
          <span class="wifi-label">WIFI名称：</span>
          <span class="wifi-value">Alisa Cake</span>
        </div>
        <div class="wifi-item">
          <span class="wifi-label">密码：</span>
          <span class="wifi-value">Alisa1234555</span>
        </div>
      </div>
    </van-dialog>

    <!-- 定制&教学弹窗 -->
    <van-dialog
      v-model:show="showCustom"
      title="定制&教学"
      :show-cancel-button="false"
      confirm-button-text="我知道了"
    >
      <div class="custom-info">
        <div class="custom-desc">
          <p>专业烘焙定制服务</p>
          <p>一对一烘焙教学课程</p>
          <p>扫描微信二维码咨询</p>
        </div>
        <div class="wechat-qr">
          <img src="/wechat QR.jpg" alt="微信二维码" class="qr-image" />
          <p class="qr-tip">长按识别二维码添加微信</p>
        </div>
      </div>
    </van-dialog>

    <!-- 桌号选择弹窗 -->
    <van-popup v-model:show="showTablePicker" position="bottom" round>
      <van-picker
        :columns="tableColumns"
        @confirm="onTableConfirm"
        @cancel="showTablePicker = false"
        :title="$t('cart.selectTable')"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

const router = useRouter()
const { t, locale } = useI18n()

const showWifi = ref(false)
const showCustom = ref(false)
const showTablePicker = ref(false)

const tableColumns = [
  { text: 'A1', value: 'A1' },
  { text: 'A2', value: 'A2' },
  { text: 'A3', value: 'A3' },
  { text: 'A4', value: 'A4' },
  { text: 'A5', value: 'A5' },
  { text: 'B1', value: 'B1' }
]

// 显示WiFi信息
const showWifiInfo = () => {
  showWifi.value = true
}

// 选择服务类型
const handleServiceSelect = (type) => {
  // 保存服务类型到localStorage
  localStorage.setItem('serviceType', type)
  
  if (type === 'dine-in') {
    // 在店堂食需要选择桌号
    showTablePicker.value = true
  } else if (type === 'delivery') {
    // 外卖配送直接进入菜单，结账时要求填写地址
    localStorage.removeItem('tableNumber') // 清除桌号
    router.push('/menu')
  } else if (type === 'takeaway') {
    // 来店自取直接进入菜单，结账时要求填写取餐时间
    localStorage.removeItem('tableNumber') // 清除桌号
    router.push('/menu')
  }
}

// 确认桌号
const onTableConfirm = ({ selectedValues }) => {
  const tableNumber = selectedValues[0]
  localStorage.setItem('tableNumber', tableNumber)
  showTablePicker.value = false
  router.push('/menu')
}

// 前往定制教学
const goToCustom = () => {
  showCustom.value = true
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-header {
  text-align: center;
  margin-bottom: 40px;

  .brand-logo {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    .logo-image {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }
  }

  .brand-name-zh {
    font-size: 32px;
    font-weight: 800;
    color: #6B4423;
    margin: 0 0 8px 0;
    letter-spacing: 2px;
  }

  .brand-slogan {
    font-size: 15px;
    color: #8D6E63;
    margin: 0;
    font-weight: 500;
    letter-spacing: 1px;
  }
}

.service-grid {
  width: 100%;
  max-width: 400px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.service-grid .service-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.service-grid .service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.service-grid .service-card.primary {
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  color: white;
  grid-column: 1 / -1;
}

.service-grid .service-card.primary .service-icon {
  color: white;
}

.service-grid .service-card.primary .service-title,
.service-grid .service-card.primary .service-subtitle {
  color: white;
}

.service-grid .service-card .service-icon {
  color: #6B4423;
  font-size: 48px;
}

.service-grid .service-card .service-text {
  text-align: center;
}

.service-grid .service-card .service-text .service-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.service-grid .service-card .service-text .service-subtitle {
  font-size: 14px;
  color: #999;
}

.function-grid {
  width: 100%;
  max-width: 400px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.function-grid .function-item {
  background: white;
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  cursor: pointer;
}

.function-grid .function-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.function-grid .function-item .van-icon {
  color: #6B4423;
}

.function-grid .function-item .function-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.function-grid .function-item .function-title {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.function-grid .function-item .function-subtitle {
  font-size: 11px;
  color: #999;
  font-weight: 400;
}

.wifi-info {
  padding: 24px;
}

.wifi-info .wifi-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.wifi-info .wifi-item:last-child {
  border-bottom: none;
}

.wifi-info .wifi-item .wifi-label {
  font-weight: 600;
  color: #666;
}

.wifi-info .wifi-item .wifi-value {
  font-size: 16px;
  color: #6B4423;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

/* 定制&教学弹窗样式 */
.custom-info {
  padding: 24px;
  text-align: center;
}

.custom-desc {
  margin-bottom: 24px;
}

.custom-desc p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.wechat-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.qr-tip {
  color: #999;
  font-size: 12px;
  margin: 0;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .home-page {
    padding: 24px 16px;
  }

  .brand-header {
    margin-bottom: 28px;
  }

  .brand-header .brand-logo {
    width: 90px;
    height: 90px;
    margin-bottom: 16px;
  }

  .brand-header .brand-logo .logo-image {
    width: 60px;
    height: 60px;
  }

  .brand-header .brand-name-zh {
    font-size: 26px;
    letter-spacing: 1px;
  }

  .brand-header .brand-slogan {
    font-size: 13px;
  }

  .service-grid {
    gap: 12px;
    margin-bottom: 24px;
  }

  .service-grid .service-card {
    padding: 18px 16px;
    gap: 12px;
  }

  .service-grid .service-card .service-icon {
    font-size: 40px;
  }

  .service-grid .service-card .service-text .service-title {
    font-size: 16px;
  }

  .service-grid .service-card .service-text .service-subtitle {
    font-size: 12px;
  }

  .function-grid {
    gap: 12px;
    margin-bottom: 24px;
    grid-template-columns: repeat(2, 1fr);
  }

  .function-grid .function-item {
    padding: 16px 8px;
    gap: 6px;
  }

  .function-grid .function-item .van-icon {
    font-size: 20px;
  }

  .function-grid .function-item .function-title {
    font-size: 13px;
  }

  .function-grid .function-item .function-subtitle {
    font-size: 10px;
  }
}

/* 小屏手机优化（宽度小于360px） */
@media (max-width: 360px) {
  .home-page {
    padding: 20px 12px;
  }

  .brand-header .brand-logo {
    width: 80px;
    height: 80px;
  }

  .brand-header .brand-logo .logo-image {
    width: 55px;
    height: 55px;
  }

  .brand-header .brand-name-zh {
    font-size: 24px;
  }

  .brand-header .brand-slogan {
    font-size: 12px;
  }

  .service-grid .service-card {
    padding: 16px 12px;
  }

  .service-grid .service-card .service-icon {
    font-size: 36px;
  }

  .service-grid .service-card .service-text .service-title {
    font-size: 15px;
  }

  .function-grid .function-item {
    padding: 14px 6px;
  }

  .function-grid .function-item span {
    font-size: 11px;
  }
}
</style>
