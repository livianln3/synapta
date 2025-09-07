const { spawn } = require("child_process");

// Inicia Cordova
const cordova = spawn("npx", ["cordova", "run", "browser"], { stdio: "inherit" });

// Inicia o proxy
const proxy = spawn("node", ["proxy.js"], { stdio: "inherit" });
