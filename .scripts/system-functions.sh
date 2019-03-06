#!/bin/sh
# This script is used to controll system functions
# like rebooting, logout etc.

functions="logout\nshutdown\nreboot"
chosen=$(echo "$functions" | dmenu -i -p $1)

case "$chosen" in
  logout)
    echo `confirm-prompt "Closing Session ?" "i3-msg exit"`
    ;;
  shutdown)
    confirm-prompt "Do you want to shutdown the Pc?" "systemctl poweroff"
    ;;
  reboot)
    confirm-prompt "Do you want to restart the Pc ?" "systemctl reboot"
    ;;
esac

