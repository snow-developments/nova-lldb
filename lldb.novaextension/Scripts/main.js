const { TaskProvider } = require("./TaskProvider");
const notification = require("./notification");

const CODELLDB_VERSION = "v1.9.0";
const CODELLDB_DESTINATION = nova.path.join(nova.extension.globalStoragePath, "codelldb");

exports.activate = function () {
  console.log("activated");

  if (!nova.inDevMode())
    getPlatformArchitecture()
      .catch(_ => notification.send("Error", "Could not determine local processor architecture."))
      .then(downloadCodeLLDB)
      .catch(_ => notification.send("Error", "Could not download LLDB binaries."));
};

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
  console.log("deactivated");
};

nova.assistants.registerTaskAssistant(new TaskProvider(), {
  identifier: "lldb",
  name: "LLDB",
});

/** @returns {Promise<string>} */
function getPlatformArchitecture() {
  return new Promise((resolve, reject) => {
    // See https://en.wikipedia.org/wiki/Uniform_Type_Identifier#Looking_up_a_UTI
    const mdls = new Process("/usr/bin/uname", {
      args: ["-m"],
      stdio: ["ignore", "pipe", "ignore"],
    });
    mdls.onStdout(arch => resolve.trim(arch));
    mdls.onDidExit(status => {
      if (status !== 0) reject(status);
    });
    mdls.start();
  });
}

/**
 * Download VS Code LLDB archive, if necessary.
 * @param arch {string}
 */
async function downloadCodeLLDB(arch) {
  if (nova.fs.stat(CODELLDB_DESTINATION)) return;
  await new Promise((resolve, reject) => {
    const curl = new Process("/usr/bin/curl", {
      args: [
        "-L",
        `https://github.com/vadimcn/codelldb/releases/download/${CODELLDB_VERSION}/codelldb-${arch}-darwin.vsix`,
        "--output",
        `"${CODELLDB_DESTINATION}.zip"`,
      ],
      stdio: "ignore",
    });
    curl.onDidExit(status => (status === 0 ? resolve() : reject()));
    curl.start();
  });
  await new Promise((resolve, reject) => {
    const curl = new Process("/usr/bin/unzip", {
      args: [`"${CODELLDB_DESTINATION}.zip"`, "-d", `"${CODELLDB_DESTINATION}"`],
      stdio: "ignore",
    });
    curl.onDidExit(status => (status === 0 ? resolve() : reject()));
    curl.start();
  });
}
