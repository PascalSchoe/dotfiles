#!/bin/sh
# This script prompts the user with the message which is $1
# After chosing either 'yes' or 'no' $2 will be executed
options="Nein\nJa"
chosen=$(echo "$options" | dmenu -i -p "$1")

if [ "$chosen" = "Ja" ]; then
  $2
fi
