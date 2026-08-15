---
title: 关于GitHub和ssh
date: 2023-12-27 11:13:43
tags:
- Notes
---

在GitHub上添加ssh密钥让我们能更加便利快速地与GitHub通信，无需提供用户名和密码，RSA加密算法确保了通信的安全。

<!-- more -->

## 如何初次建立ssh连接

如果开始在`$HOME`目录里有`~/.ssh/id_rsa.pub`文件，需要输入

```bash
ssh-keygen -t rsa -C 'your_email@example.com'
```

得到密钥。找到产生的`id_rsa.pub`文件。将里面的内容复制。

进入GitHub，打开个人Settings，点SSH and GPG keys选项，点击New SSH key，将复制内容粘贴到公钥内容里，名称会自己生成也可以自己修改。最后确认保存即可。

测试是否能够建立连接，输入：

```bash
ssh -T git@github.com
```

第一次会显示是否continue，输入yes，看到

> You've successfully authenticated, but GitHub does not provide shell access.

表示已经成功连上。

## 为仓库添加ssh的remote及使用方法


