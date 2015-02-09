#!/bin/sh
echo "Installing all the necessary dependencies"
echo "-----------------------------------------"
npm install
echo "-----------------------------------------"

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
SHELLSCRIPT="#!/bin/sh\nnode $SCRIPTPATH/src/app.js \$*\n"

echo -e $SHELLSCRIPT >> jira-terminal
chmod +x jira-terminal

if [ "$(whoami)" != "root" ]; then
	echo "Im not root. So please move the shell script 'jira-terminal' to your bin folder" 
else
	echo "Copying 'jira-terminal' to /usr/bin/"
	mv jira-terminal /usr/bin/jira-terminal
fi
echo "------------------------------------------"
echo "You still have to configure the config.json file. See example.config.json."
