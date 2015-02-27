# Jira Terminal
Let's go away from that ugly GUI of jira and lets just stick to our terminals.  
I started, created this project to improve my work flow. I was already using git, npm, grunt, bower ... etc. in my terminal, I wanted to use JIRA as well in my terminal.

Currently I'm still developing on this. So this is in no means ready to use and replaces everything of the GUI etc etc. But it is a start.

# Implemented
Currently jira-terminal can do this:
 * Retrieve an issue and all the information
 * Show all the filters the user created.
 * Show all the issues that hang that match the filter
 * Perform start transition (currently this matches our custom defined transition in jira).
 * Perform stop transition (same comment as start transition).
 * You can sort and filter in all tables that are outputted.
 * Start a branch and checkout when starting an issue.
 * Showing all the comments for an issue.

# Work in progress
 * Custom transitions (let the user define through a json file how `issue start` and `issue stop` should work, also let the user add more `issue` commands through configuring an json).
 * Adding comment(s) to an issue.
 * Create a new issue.
 * Search command with jql syntax.
 * Auto complete in terminal.
 * Oauth and better config file. Currently you have set your jira user name and password in a config file which is unsafe of course.I'll be lazy to do this since JIRA only supports oauth1 and oauth1 is a bitch.

# Install
Edit the config file, see `example.config.json`.
Run `install.sh` it will install all the dependencies and copy a shell script to `/usr/bin/` so you can invoke it with `jira-terminal` from anywhere.

# How to use it
All the plugins have the `help` commands, IE `jira-terminal issue help`. 

# Licence 
MIT