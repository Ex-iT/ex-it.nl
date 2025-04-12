---
title: TakeOver
description: 'Vhost / subdomain enumeration and domain takeover'
pubDate: 2024-08-07
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/e11be3e91db093a84dd92e794e9f8181.png'
---

Checking for subdomains:

```bash
ffuf -u http://10.10.140.190 -H "Host: FUZZ.futurevera.thm" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -fs 0
...[snip]...
portal                  [Status: 200, Size: 69, Words: 9, Lines: 2, Duration: 28ms]
payroll                 [Status: 200, Size: 70, Words: 9, Lines: 2, Duration: 26ms]
...[snip]...
```

Also checking for subdomains on HTTPS:

```bash
ffuf -u https://10.10.140.190 -H "Host: FUZZ.futurevera.thm" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -fs 4605
...[snip]...
blog                    [Status: 200, Size: 3838, Words: 1326, Lines: 81, Duration: 27ms]
support                 [Status: 200, Size: 1522, Words: 367, Lines: 34, Duration: 28ms]
...[snip]...
```

The `support` domain has an alt DNS name in the certificate:

```
secrethelpdesk934752.support.futurevera.thm
```
So we add this to our `/etc/hosts` file.

When visiting that URL we get redirected to: `http://flag{<REDACTED>}.s3-website-us-west-3.amazonaws.com/`

Flag: `flag{<REDACTED>}`
