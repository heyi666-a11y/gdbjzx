#!/bin/bash

# 腾讯云 COS 部署脚本
# 使用前请先配置腾讯云 CLI: tccli configure

# 配置参数
BUCKET_NAME="campus-network-gdbjzx"
REGION="ap-guangzhou"
LOCAL_PATH="d:/biancheng/校园网"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  广东北江中学校园网 - COS 部署脚本${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 检查 tccli 是否安装
if ! command -v tccli &> /dev/null; then
    echo -e "${RED}错误: 未安装腾讯云 CLI${NC}"
    echo "请先安装: pip install tccli"
    exit 1
fi

# 检查是否已配置
echo -e "${YELLOW}检查腾讯云 CLI 配置...${NC}"
tccli configure list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 未配置腾讯云 CLI${NC}"
    echo "请先运行: tccli configure"
    echo "需要输入: SecretId, SecretKey, Region(如ap-guangzhou)"
    exit 1
fi

echo -e "${GREEN}✓ CLI 配置正常${NC}"
echo ""

# 创建存储桶（如果不存在）
echo -e "${YELLOW}创建 COS 存储桶: ${BUCKET_NAME}...${NC}"
tccli cos CreateBucket --Bucket ${BUCKET_NAME} --Region ${REGION} --ACL public-read
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 存储桶创建成功${NC}"
else
    echo -e "${YELLOW}存储桶可能已存在，继续...${NC}"
fi
echo ""

# 上传文件
echo -e "${YELLOW}上传网站文件到 COS...${NC}"
echo "上传路径: ${LOCAL_PATH}"
echo "目标存储桶: ${BUCKET_NAME}"
echo ""

# 使用 coscmd 上传（需要先安装 coscmd: pip install coscmd）
if command -v coscmd &> /dev/null; then
    # 配置 coscmd
    coscmd config -a $(tccli configure get secretId) -s $(tccli configure get secretKey) -b ${BUCKET_NAME} -r ${REGION}
    
    # 上传文件
    coscmd upload -r "${LOCAL_PATH}" /
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 文件上传成功${NC}"
    else
        echo -e "${RED}✗ 文件上传失败${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}未安装 coscmd，使用 tccli 上传...${NC}"
    echo -e "${YELLOW}建议安装 coscmd 获得更好的上传体验: pip install coscmd${NC}"
    
    # 使用 tccli 上传（需要手动指定每个文件）
    echo "正在上传文件..."
    for file in $(find "${LOCAL_PATH}" -type f); do
        relative_path=${file#${LOCAL_PATH}/}
        tccli cos Upload --Bucket ${BUCKET_NAME} --Region ${REGION} --Key "${relative_path}" --Body "${file}"
    done
fi

echo ""

# 配置静态网站
echo -e "${YELLOW}配置静态网站托管...${NC}"
tccli cos PutBucketWebsite --Bucket ${BUCKET_NAME} --Region ${REGION} --WebsiteConfiguration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
}'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 静态网站配置成功${NC}"
else
    echo -e "${YELLOW}静态网站配置可能已存在${NC}"
fi

echo ""

# 获取访问地址
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "访问地址:"
echo -e "  ${GREEN}http://${BUCKET_NAME}.cos-website.${REGION}.myqcloud.com${NC}"
echo ""
echo -e "存储桶信息:"
echo -e "  名称: ${BUCKET_NAME}"
echo -e "  地域: ${REGION}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "1. 如需绑定自定义域名，请在腾讯云控制台 → CDN → 域名管理中添加"
echo "2. 如需 HTTPS，可在 CDN 中配置 SSL 证书（免费申请）"
echo "3. 如需加速访问，建议配置 CDN 加速"
echo ""
