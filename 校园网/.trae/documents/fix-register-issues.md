# 修复校园网注册问题计划

## 问题分析

1. **数据库表不存在** - 错误信息：`Could not find the table 'public.profiles' in the schema cache`
2. **showToast 函数未定义** - 学生注册页面缺少 toast 提示函数

## 修复步骤

### 步骤 1: 修复 showToast 函数
- 在 `pages/register-student.html` 中添加 `showToast` 函数定义

### 步骤 2: 创建数据库初始化 SQL
- 创建 `database/init.sql` 文件，包含创建所有表结构的 SQL 语句
- 用户需要在 Supabase Dashboard 中执行此 SQL

### 步骤 3: 文档说明
- 提供 Supabase 数据库配置的详细说明

## 实施

