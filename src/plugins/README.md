# Creating a new plugin
To create a new plugin: create a new file, the file should have the following structure:
```javascript
/**
 * @param {Object} jiraApi The JiraApi object as returned by the package 'jira'
 * @param {Object} argv The custom arguments passed. You should overwrite this with the arguments that are returned by the package 'minimist'.
*/
module.exports = function(jiraApi, argv){
    var self = {
        name: 'Name', //This should match the file name
        pattern: 'custom-pattern', //The patter on which this plugin should be invoked on.
        help: 'your help string' //This will be used by 'jira-terminal help'
    }
    self.hook = function(){
        // The main hook, this will be called.
    }
    return self;
}
```
