const { TaskProvider } = require("./TaskProvider");

exports.activate = function() {
  console.log("activated");
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
}

nova.assistants.registerTaskAssistant(new TaskProvider(), {
  identifier: "lldb-tasks",
  name: "LLDB"
});

// https://docs.nova.app/extensions/debug-adapters
class DebugProvider {
  // TODO: https://github.com/vadimcn/codelldb/tree/master/adapter
}
