# This script prompts the user with the message which is $1
# After chosing either 'yes' or 'no' $2 will be executed
[ $(echo "Nein\nJa" | dmenu -i -p "$1") \
  == "Ja" ] && $2
