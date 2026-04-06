#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯云 COS 部署脚本
"""

import os
import sys
import json
from pathlib import Path

# 配置
BUCKET_NAME = "campus-network-gdbjzx"
REGION = "ap-guangzhou"
LOCAL_PATH = r"d:\biancheng\校园网"

def print_header():
    print("=" * 50)
    print("  广东北江中学校园网 - COS 部署脚本")
    print("=" * 50)
    print()

def check_qcloud_sdk():
    """检查腾讯云 SDK"""
    try:
        from qcloud_cos import CosConfig, CosS3Client
        return True
    except ImportError:
        print("[安装] 正在安装腾讯云 COS SDK...")
        os.system("pip install cos-python-sdk-v5 -q")
        try:
            from qcloud_cos import CosConfig, CosS3Client
            return True
        except ImportError:
            print("[错误] SDK 安装失败")
            return False

def get_credentials():
    """获取腾讯云凭证"""
    # 尝试从环境变量获取
    secret_id = os.environ.get('TENCENTCLOUD_SECRET_ID')
    secret_key = os.environ.get('TENCENTCLOUD_SECRET_KEY')
    
    if not secret_id or not secret_key:
        # 尝试从配置文件读取
        config_path = os.path.expanduser('~/.tccli/default.credential')
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    secret_id = config.get('secretId')
                    secret_key = config.get('secretKey')
            except:
                pass
    
    return secret_id, secret_key

def create_bucket(client):
    """创建存储桶"""
    print(f"[步骤1] 创建 COS 存储桶: {BUCKET_NAME}...")
    try:
        client.create_bucket(
            Bucket=BUCKET_NAME,
            ACL='public-read'
        )
        print("[成功] 存储桶创建成功")
    except Exception as e:
        if "BucketAlreadyExists" in str(e) or "bucket already exist" in str(e).lower():
            print("[提示] 存储桶已存在，继续...")
        else:
            print(f"[提示] {e}")
    print()

def upload_files(client, local_path, prefix=""):
    """上传文件"""
    print("[步骤2] 上传网站文件到 COS...")
    print(f"上传路径: {local_path}")
    print(f"目标存储桶: {BUCKET_NAME}")
    print()
    
    base_path = Path(local_path)
    uploaded = 0
    failed = 0
    
    for file_path in base_path.rglob("*"):
        if file_path.is_file():
            relative_path = str(file_path.relative_to(base_path)).replace("\\", "/")
            if prefix:
                key = f"{prefix}/{relative_path}"
            else:
                key = relative_path
            
            try:
                client.upload_file(
                    Bucket=BUCKET_NAME,
                    LocalFilePath=str(file_path),
                    Key=key,
                    PartSize=1,
                    MAXThread=10,
                    EnableMD5=False
                )
                uploaded += 1
                print(f"  ✓ {relative_path}")
            except Exception as e:
                failed += 1
                print(f"  ✗ {relative_path} - {e}")
    
    print()
    print(f"[完成] 上传成功: {uploaded} 个文件")
    if failed > 0:
        print(f"[警告] 上传失败: {failed} 个文件")
    print()

def configure_website(client):
    """配置静态网站"""
    print("[步骤3] 配置静态网站托管...")
    try:
        client.put_bucket_website(
            Bucket=BUCKET_NAME,
            WebsiteConfiguration={
                'IndexDocument': {'Suffix': 'index.html'},
                'ErrorDocument': {'Key': 'index.html'}
            }
        )
        print("[成功] 静态网站配置成功")
    except Exception as e:
        print(f"[提示] {e}")
    print()

def main():
    print_header()
    
    # 检查 SDK
    if not check_qcloud_sdk():
        sys.exit(1)
    
    from qcloud_cos import CosConfig, CosS3Client
    
    # 获取凭证
    secret_id, secret_key = get_credentials()
    
    if not secret_id or not secret_key:
        print("[错误] 未找到腾讯云凭证")
        print("请设置环境变量:")
        print("  TENCENTCLOUD_SECRET_ID=你的SecretId")
        print("  TENCENTCLOUD_SECRET_KEY=你的SecretKey")
        print()
        print("或运行 tccli configure 配置")
        sys.exit(1)
    
    # 创建客户端
    config = CosConfig(
        Region=REGION,
        SecretId=secret_id,
        SecretKey=secret_key,
        Token=None,
        Scheme='https'
    )
    client = CosS3Client(config)
    
    # 执行部署
    create_bucket(client)
    upload_files(client, LOCAL_PATH)
    configure_website(client)
    
    # 输出结果
    print("=" * 50)
    print("  部署完成！")
    print("=" * 50)
    print()
    print("访问地址:")
    print(f"  http://{BUCKET_NAME}.cos-website.{REGION}.myqcloud.com")
    print()
    print("存储桶信息:")
    print(f"  名称: {BUCKET_NAME}")
    print(f"  地域: {REGION}")
    print()
    print("提示:")
    print("1. 如需绑定自定义域名，请在腾讯云控制台 > CDN > 域名管理中添加")
    print("2. 如需 HTTPS，可在 CDN 中配置 SSL 证书（免费申请）")
    print("3. 如需加速访问，建议配置 CDN 加速")
    print()

if __name__ == "__main__":
    main()
