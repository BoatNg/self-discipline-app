# Supabase 云端同步配置指南

## 1. 数据库表结构

需要在Supabase中创建以下表：

### user_backups 表（用户备份表）

```sql
-- 创建用户备份表
CREATE TABLE IF NOT EXISTS user_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{"tasks":[],"urgeLogs":[],"checkInRecords":[]}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- 确保每个用户只有一条备份记录
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_backups_user_id ON user_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_backups_updated_at ON user_backups(updated_at DESC);

-- 启用RLS（行级安全）
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的备份
CREATE POLICY "Users can CRUD own backups" ON user_backups
  FOR ALL USING (auth.uid() = user_id);
```

## 2. Supabase 控制台操作步骤

### 步骤1: 登录Supabase

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录到你的项目

### 步骤2: 进入SQL编辑器

1. 在左侧菜单点击 `SQL Editor`
2. 点击 `New query`

### 步骤3: 执行建表SQL

复制上面的SQL语句到编辑器中，点击 `Run`

### 步骤4: 验证表创建成功

1. 返回左侧菜单，点击 `Table Editor`
2. 应该能看到 `user_backups` 表
3. 确认有正确的列结构和索引

## 3. 验证配置

执行以下测试查询确保配置正确：

```sql
-- 测试：查询表结构
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_backups';

-- 测试：验证RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_backups';
```

## 4. 注意事项

### 安全配置

- ✅ 已启用RLS（行级安全）
- ✅ 用户只能访问自己的数据
- ✅ 使用 `ON DELETE CASCADE` 自动清理数据

### 性能优化

- ✅ 为 `user_id` 创建索引（快速用户查询）
- ✅ 为 `updated_at` 创建索引（按时间排序）
- ✅ 使用 `UNIQUE(user_id)` 确保唯一性

### 数据格式

- `data` 字段存储JSON格式：
  ```json
  {
    "tasks": [], // 任务数组
    "urgeLogs": [], // 冲动记录数组
    "checkInRecords": [] // 打卡记录数组
  }
  ```

## 5. 故障排除

### 常见问题

1. **表创建失败**: 检查数据库权限
2. **RLS策略无效**: 确认已启用RLS并创建了策略
3. **索引未生效**: 等待数据库刷新或重启服务

### 联系支持

如遇到技术问题，请参考：

- [Supabase文档](https://supabase.com/docs)
- [GitHub Issues](https://github.com/anomalyco/self-discipline-app/issues)

## 6. 测试连接

配置完成后，在应用设置页面：

1. 点击"登录/注册"按钮
2. 使用邮箱密码注册账号
3. 登录后测试"上传到云端"功能
4. 测试"从云端恢复"功能
