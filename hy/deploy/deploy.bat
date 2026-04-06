@echo off
chcp 65001
cls

echo ========================================
echo   广东北江中学校园网 - COS 部署脚本
echo ========================================
echo.

REM 配置
set BUCKET_NAME=campus-network-gdbjzx
set REGION=ap-guangzhou
set LOCAL_PATH=d:\biancheng\校园网

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未安装 Python
    pause
    exit /b 1
)

echo [检查] Python 已安装
echo.

REM 检查并安装 SDK
echo [检查] 安装腾讯云 COS SDK...
pip show cos-python-sdk-v5 >nul 2>&1
if errorlevel 1 (
    pip install cos-python-sdk-v5 -q
)

echo [完成] SDK 就绪
echo.

REM 运行部署脚本
python "%~dp0deploy_script.py"

pause
