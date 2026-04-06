# 腾讯云部署指南

## 方案一：腾讯云 COS + CDN（推荐）

### 1. 创建 COS 存储桶

```bash
# 使用腾讯云 CLI 创建存储桶
tccli cos CreateBucket --Bucket campus-network-xxx --Region ap-guangzhou
```

### 2. 配置静态网站托管

在 COS 控制台：
1. 进入存储桶 → 基础配置 → 静态网站
2. 开启静态网站
3. 索引文档：index.html
4. 错误文档：index.html

### 3. 上传文件

```bash
# 使用 COSCMD 上传
coscmd upload -r d:/biancheng/校园网 /
```

### 4. 配置 CDN（可选但推荐）

```bash
# 创建 CDN 加速域名
tccli cdn AddCdnDomain --Domain campus.xxx.com --ServiceType web --OriginType cos --Origin campus-network-xxx.cos.ap-guangzhou.myqcloud.com
```

---

## 方案二：腾讯云轻量应用服务器

### 1. 购买轻量服务器
- 选择：Linux 系统（CentOS/Ubuntu）
- 配置：2核2G 即可

### 2. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install nginx
```

### 3. 上传网站文件

```bash
# 使用 scp 上传
scp -r d:/biancheng/校园网/* root@你的服务器IP:/var/www/html/
```

### 4. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 方案三：腾讯云 CloudBase（云开发）

### 1. 安装 CloudBase CLI

```bash
npm install -g @cloudbase/cli
```

### 2. 登录

```bash
tcb login
```

### 3. 初始化项目

```bash
tcb init --project campus-network
```

### 4. 部署

```bash
tcb hosting deploy d:/biancheng/校园网 -e your-env-id
```

---

## 部署脚本（方案二 - 轻量服务器）

创建 `deploy.sh`：

```bash
#!/bin/bash

# 配置
SERVER_IP="你的服务器IP"
SERVER_USER="root"
LOCAL_PATH="d:/biancheng/校园网"
REMOTE_PATH="/var/www/html"

# 上传文件
echo "正在上传文件..."
scp -r "$LOCAL_PATH"/* $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

# 设置权限
ssh $SERVER_USER@$SERVER_IP "chown -R www-data:www-data $REMOTE_PATH && chmod -R 755 $REMOTE_PATH"

echo "部署完成！"
echo "访问地址: http://$SERVER_IP"
```

---

## 域名和 HTTPS

### 1. 配置域名解析
在腾讯云 DNS 解析控制台添加 A 记录指向服务器 IP

### 2. 申请 SSL 证书（免费）
腾讯云 SSL 证书控制台 → 申请免费证书

### 3. Nginx HTTPS 配置

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 推荐方案

对于校园网这种纯静态网站，**推荐方案一（COS + CDN）**：
- 成本低：COS 存储费用低，CDN 流量费用便宜
- 速度快：CDN 全球加速
- 免运维：无需管理服务器
- 自动 HTTPS：CDN 自带 SSL 证书

---

## 需要的信息

请提供以下信息，我可以帮你生成具体的部署命令：

1. **你的腾讯云 SecretId 和 SecretKey**（用于 CLI 认证）
2. **你想使用的域名**（如 campus.gdbjzx.com）
3. **选择哪个方案**（COS/CDN、轻量服务器、CloudBase）
4. **服务器信息**（如果选择轻量服务器方案）
