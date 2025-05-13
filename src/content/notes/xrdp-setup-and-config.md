---
title: 'xRDP Setup and Configuration'
description: 'Installing xRDP, configuring Polkit rules and fixing the default theme.'
pubDate: 2025-05-13
category: ''
tags: ['xrdp']
image: '/images/notes/xrdp-setup-and-config.png'
---

I always struggle with setting up xRDP properly, I always forget how to configure the Polkit rules properly to not get all the annoying password popups and getting the default theme to work.

## Installing xRDP

The installation process is really straight forward.

```bash
sudo apt install xrdp
```

Checking the status with `systemctl`:

```bash
sudo systemctl status xrdp
● xrdp.service - xrdp daemon
     Loaded: loaded (/lib/systemd/system/xrdp.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2025-05-13 10:30:34 CEST; 3min 22s ago
       Docs: man:xrdp(8)
             man:xrdp.ini(5)
    Process: 779 ExecStartPre=/bin/sh /usr/share/xrdp/socksetup (code=exited, status=0/SUCCESS)
    Process: 790 ExecStart=/usr/sbin/xrdp $XRDP_OPTIONS (code=exited, status=0/SUCCESS)
   Main PID: 816 (xrdp)
      Tasks: 2 (limit: 19077)
     Memory: 21.2M
        CPU: 9.122s
     CGroup: /system.slice/xrdp.service
             ├─ 816 /usr/sbin/xrdp
             └─3621 /usr/sbin/xrdp
...[snip]...
```

And making sure it's 'enabled' with `systemctl`:

```bash
sudo systemctl enable xrdp
Synchronizing state of xrdp.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable xrdp
```

At this point we should be able to RDP to the machine.

## Polkit Rules

Now let's configure the Polkit rules to get rid of the password popups:

```bash
sudo bash -c "cat >/etc/polkit-1/localauthority/50-local.d/45-allow.colord.pkla" <<EOF
[Allow Colord all Users]
Identity=unix-user:*
Action=org.freedesktop.color-manager.create-device;org.freedesktop.color-manager.create-profile;org.freedesktop.color-manager.delete-device;org.freedesktop.color-manager.delete-profile;org.freedesktop.color-manager.modify-device;org.freedesktop.color-manager.modify-profile
ResultAny=no
ResultInactive=no
ResultActive=yes
EOF
```

And also add a Polkit rule to allow package updates:

```bash
sudo bash -c "cat >/etc/polkit-1/localauthority/50-local.d/46-allow-update-repo.pkla" <<EOF
[Allow Package Management all Users]
Identity=unix-user:*
Action=org.freedesktop.packagekit.system-sources-refresh;org.freedesktop.packagekit.system-network-proxy-configure
ResultAny=yes
ResultInactive=yes
ResultActive=yes
EOF
```

## Default Theme

Now let's configure the default theme:

```bash
# Backup the file before modifying it
sudo cp /etc/xrdp/startwm.sh /etc/xrdp/startwm.sh.bak
sudo sed -i "4 a # Set default theme\ncat <<EOF > ~/.xsessionrc\nexport GNOME_SHELL_SESSION_MODE=$GNOME_SHELL_SESSION_MODE\nexport XDG_CURRENT_DESKTOP=$XDG_CURRENT_DESKTOP\nexport XDG_CONFIG_DIRS=$XDG_CONFIG_DIRS\nEOF\n" /etc/xrdp/startwm.sh
```

Now make sure to logout and login again to see the changes.
