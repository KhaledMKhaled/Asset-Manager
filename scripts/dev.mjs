import { spawn } from "node:child_process";

const cwd = process.cwd();

function run(label, command, args) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
}

const apiBuild = spawn("pnpm", ["--filter", "@workspace/api-server", "run", "build"], {
  cwd,
  shell: true,
  stdio: "inherit",
});

apiBuild.on("exit", (code) => {
  if (code && code !== 0) {
    process.exit(code);
    return;
  }

  const api = run("api", "pnpm", ["--filter", "@workspace/api-server", "run", "start"]);
  const web = run("web", "pnpm", ["--filter", "web", "run", "dev"]);

  const shutdown = () => {
    api.kill();
    web.kill();
    process.exit();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
});
