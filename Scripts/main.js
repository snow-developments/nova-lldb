const { TaskProvider } = require("./TaskProvider");

exports.activate = function() {
  // Do work when the extension is activated
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
}

nova.assistants.registerTaskAssistant(new TaskProvider(), {
  identifier: "example-tasks",
  name: "Examples"
});

class DebugProvider {
  // TODO: https://github.com/vadimcn/codelldb/tree/master/adapter
}
