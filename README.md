# Jira Terminal
Let's go away from that ugly GUI of jira and lets just stick to our terminals.  
I  started/created this project to improve my work flow. I was already using git, npm, grunt, bower ... etc. in my terminal, I wanted to use JIRA as well in my terminal.

Currently I'm still developing on this. So this is in no means ready to use and replaces everything of the GUI. But it is a start.

# Work in progress
 * Search command with jql syntax.
 * Auto complete in terminal.
 * Oauth and better config file. **Currently you have set your jira user name and password in a config file which is unsafe.** After version 0.1.0 this has the highest priority.
 * Extend the Filter plugin with showing which issues were edited since it the last time.

# Install
To install: `npm install -g jira-terminal`.  
First time running it will promp you with some information to create a config file.

# How to use it
All the plugins have the `help` commands, IE `jira-terminal issue help`. This also shows what is already implemented.

# Licence 
MIT
