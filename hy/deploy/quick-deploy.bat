@echo off
chcp 65001

REM 腾讯云 COS 快速部署脚本 (Windows)
REM 使用前请先安装腾讯云 CLI: pip install tccli

echo ========================================
echo   广东北江中学校园网 - COS 部署脚本
echo ========================================
echo.

REM 配置参数
set BUCKET_NAME=campus-network-gdbjzx
set REGION=ap-guangzhou
set LOCAL_PATH=d:\biancheng\校园网

REM 检查 tccli 是否安装
tccli --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未安装腾讯云 CLI
    echo 请先安装: pip install tccli
    pause
    exit /b 1
)

echo [检查] CLI 已安装
echo.

REM 创建存储桶
echo [步骤1] 创建 COS 存储桶: %BUCKET_NAME%...
tccli cos CreateBucket --Bucket %BUCKET_NAME% --Region %REGION% --ACL public-read
if errorlevel 1 (
    echo [提示] 存储桶可能已存在，继续...
) else (
    echo [成功] 存储桶创建成功
)
echo.

REM 上传文件
echo [步骤2] 上传网站文件到 COS...
echo 上传路径: %LOCAL_PATH%
echo 目标存储桶: %BUCKET_NAME%
echo.

REM 使用 coscmd 上传（推荐）
coscmd --version >nul 2>&1
if errorlevel 1 (
    echo [提示] 未安装 coscmd，建议安装: pip install coscmd
    echo [提示] 现在使用 tccli 逐个上传文件...
    echo.
    
    REM 递归上传所有文件
    for /r "%LOCAL_PATH%" %%f in (*) do (
        set "file_path=%%f"
        setlocal enabledelayedexpansion
        set "relative_path=!file_path:%LOCAL_PATH%=!"
        set "relative_path=!relative_path:\=/!"
        if "!relative_path:~0,1!"=="/" set "relative_path=!relative_path:~1!"
        
        echo 上传: !relative_path!
        tccli cos Upload --Bucket %BUCKET_NAME% --Region %REGION% --Key "!relative_path!" --Body "%%f" >nul 2>&1
        endlocal
    )
) else (
    echo [使用 coscmd 上传...]
    coscmd config -a %TC_SECRET_ID% -s %TC_SECRET_KEY% -b %BUCKET_NAME% -r %REGION%
    coscmd upload -r "%LOCAL_PATH%" /
)

echo.
echo [成功] 文件上传完成
echo.

REM 配置静态网站
echo [步骤3] 配置静态网站托管...
tccli cos PutBucketWebsite --Bucket %BUCKET_NAME% --Region %REGION% --WebsiteConfiguration "{\"IndexDocument\":{\"Suffix\":\"index.html\"},\"ErrorDocument\":{\"Key\":\"index.html\"}}"
if errorlevel 1 (
    echo [提示] 静态网站配置可能已存在
) else (
    echo [成功] 静态网站配置成功
)

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 访问地址:
echo   http://%BUCKET_NAME%.cos-website.%REGION%.myqcloud.com
echo.
echo 存储桶信息:
echo   名称: %BUCKET_NAME%
echo   地域: %REGION%
echo.
echo 提示:
echo 1. 如需绑定自定义域名，请在腾讯云控制台 ^> CDN ^> 域名管理中添加
echo 2. 如需 HTTPS，可在 CDN 中配置 SSL 证书（免费申请）
echo 3. 如需加速访问，建议配置 CDN 加速
echo.

pause
