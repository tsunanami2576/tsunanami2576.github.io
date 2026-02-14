# Valentine Photo Heart - 快速入门指南 💝

## 🚀 快速开始

### 第一步：准备 GitHub Token

1. 访问 https://github.com/settings/tokens/new
2. 填写描述（如 "Valentine Photo Heart"）
3. 选择有效期（建议 30-90 天）
4. 勾选权限：
   - ✅ **repo** (完整仓库访问权限)
5. 点击 "Generate token" 并**立即复制保存**（刷新后不可见）

### 第二步：打开网页并配置

1. 在浏览器中打开 `index.html`
2. 首次访问会自动弹出配置窗口
3. 填写信息：
   ```
   GitHub 用户名: 你的GitHub用户名
   仓库名称: your-username.github.io
   Token: ghp_xxxxxxxxxxxxx (刚才复制的)
   照片路径: valentine/assets/photos (默认即可)
   ```
4. 点击 **"测试连接"** 确认配置正确
5. 点击 **"保存配置"** 完成设置

### 第三步：上传照片

1. 点击心形中的任意 **"+"** 占位符
2. 选择照片（支持 JPG、PNG 等格式）
3. 等待上传完成（会显示加载动画）
4. 照片会自动显示在心形布局中

### 第四步：查看照片

1. 点击任意照片进入查看模式
2. **拖动鼠标/手指**：产生 3D 倾斜和反光效果
3. 照片右下角自动显示拍摄时间
4. **再次点击**照片或背景退出

---

## 📱 移动端使用

在手机或平板上访问：

1. 打开浏览器访问你的 GitHub Pages 地址
2. 点击 "+" 可以直接调用相机拍照上传
3. 触摸拖动照片产生 3D 效果
4. 所有功能与桌面端一致

---

## 🔧 常见问题

### Q: 上传失败怎么办？

**A:** 检查以下几点：
- Token 是否有 `repo` 权限
- Token 是否过期
- 仓库名称是否正确
- 网络连接是否正常

### Q: 照片上传后在哪里？

**A:** 照片会上传到你的 GitHub 仓库：
```
your-username.github.io/
└── valentine/
    └── assets/
        └── photos/
            ├── photo-xxxxx.jpg
            ├── photo-xxxxx.jpg
            └── photos.json (元数据)
```

### Q: 可以换设备访问吗？

**A:** 可以！照片存储在 GitHub，任何设备访问网页都能看到：
- 配置会保存在浏览器 LocalStorage
- 新设备需要重新配置 Token
- 照片会自动从 GitHub 加载

### Q: Token 安全吗？

**A:** 
- Token 会编码后存储在浏览器本地
- 不建议在公共设备上保存
- 建议定期更换 Token
- 可以随时在 GitHub 撤销 Token

### Q: 如何修改配置？

**A:** 点击右下角的 **齿轮图标** ⚙️ 即可重新打开配置窗口

### Q: 支持多少张照片？

**A:** 
- 默认布局支持 **10-20 张**照片
- 取决于心形布局算法生成的位置数量
- 可以修改代码增加照片数量

---

## 🎨 自定义

### 修改心形大小

编辑 `css/main.css`：
```css
:root {
    --heart-size: 600px;  /* 改为你想要的大小 */
}
```

### 修改照片尺寸

编辑 `js/heart-layout.js`：
```javascript
sizes: [
    { name: 'small', width: 80, height: 80, weight: 0.4 },
    { name: 'medium', width: 120, height: 120, weight: 0.35 },
    { name: 'large', width: 150, height: 150, weight: 0.25 }
]
```

### 修改配色

编辑 `css/main.css`：
```css
:root {
    --primary-pink: #FF69B4;  /* 主色调 */
    --rose-gold: #B76E79;     /* 玫瑰金 */
    --light-pink: #FFB6C1;    /* 浅粉色 */
}
```

---

## 📦 部署到 GitHub Pages

### 方法一：直接推送到仓库

```bash
cd /home/lmz/Learning/HTML/valentine
git init
git add .
git commit -m "Add Valentine Photo Heart"
git remote add origin https://github.com/your-username/your-username.github.io.git
git push -u origin main
```

访问：`https://your-username.github.io/valentine/`

### 方法二：作为子目录部署

如果你的 `your-username.github.io` 已有内容：

```bash
# 在仓库根目录
mkdir -p valentine
cp -r /home/lmz/Learning/HTML/valentine/* valentine/
git add valentine/
git commit -m "Add Valentine Photo Heart"
git push
```

---

## 🎁 情人节使用建议

1. **提前准备**：
   - 提前几天部署好网站
   - 选好 10-20 张精选照片
   - 确保照片有 EXIF 时间信息

2. **惊喜呈现**：
   - 生成短链接或二维码
   - 情人节当天分享给 TA
   - 引导 TA 点击照片查看

3. **互动玩法**：
   - 可以让 TA 也上传照片
   - 每张照片讲一个故事
   - 定期添加新照片

---

## 💡 技术支持

遇到问题？
1. 检查浏览器控制台（F12）的错误信息
2. 确认 GitHub Token 配置正确
3. 查看 README.md 了解更多技术细节

---

**祝你情人节快乐！💕**

Made with ❤️
