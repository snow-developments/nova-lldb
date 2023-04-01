const { TaskProvider } = require("./TaskProvider");

exports.activate = function() {
  console.log("activated");
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
}

nova.assistants.registerTaskAssistant(new TaskProvider(), {
  identifier: "lldb",
  name: "LLDB"
});
