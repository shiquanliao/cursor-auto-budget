<div align="center">

# Cursor Auto Starter

**免费体验 · 一键安装 · 用量透明**

[![立即体验](https://img.shields.io/badge/立即体验-进入安装页-75f0bc?style=for-the-badge)](https://panel.mixrai.com/cursor-install?utm_source=github&utm_medium=organic&utm_campaign=cursor_auto_starter&utm_content=readme_top)

</div>

---

## 这是什么

这是一个面向 Cursor 用户的环境检测与体验入口：

- 检查当前系统、芯片架构和 Cursor 安装状态；
- 检查 `panel.mixrai.com` 是否可以访问；
- 说明体验额度、签到奖励和实际用量口径；
- 检测完成后直接进入平台安装页。

> 非官方社区项目，与 Cursor / Anysphere 无隶属或授权关系。

## 30 秒环境检测

项目只有一个标准库 Python 脚本，不安装依赖、不修改 Cursor、不读取账号信息：

```bash
python3 doctor.py
```

需要机器可读结果：

```bash
python3 doctor.py --json
```

检测完成后前往：

**https://panel.mixrai.com/cursor-install**

## 免费体验口径

建议首发参数：

| 阶段 | 体验额度 | 说明 |
|---|---:|---|
| 完成注册 | $0.50 | 覆盖一次轻量体验 |
| 完成安装并首次连接 | 再送 $1.50 | 合计 $2 体验额度 |
| 每日签到 | $0.05–$0.15 | 每个自然日一次 |
| 连续 7 天 | $0.50 | 奖励真实留存 |

一次任务的上下文长度和工具调用次数不同，因此不承诺固定“免费次数”。完整设计见
[免费体验层设计](docs/FREE_TIER_DESIGN.md)。

## 安全边界

本项目不会提供：

- 批量注册或临时邮箱自动注册；
- 验证码 / Turnstile 绕过；
- 机器标识重置；
- 修改第三方订阅状态；
- 窃取或共享第三方账号凭据。

`doctor.py` 只做只读检测。源码很短，建议运行前自行审阅。

## 反馈

遇到环境检测或安装问题，可以提交
[Issue](https://github.com/shiquanliao/cursor-auto-budget/issues/new?template=beta.yml)。

公开 Issue 中请勿提交账号、密码、Cookie、API Token 或付款信息。

## License

[MIT](LICENSE)
