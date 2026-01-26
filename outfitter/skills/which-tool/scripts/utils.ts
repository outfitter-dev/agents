/**
 * Check if a command-line tool is available and get its version
 */
export async function checkTool(
  cmd: string,
): Promise<{ available: boolean; version?: string }> {
  try {
    // Check if command exists
    const whichProc = Bun.spawn(["which", cmd], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await whichProc.exited;

    if (exitCode !== 0) {
      return { available: false };
    }

    // Try to get version
    try {
      const versionProc = Bun.spawn([cmd, "--version"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const versionOut = await new Response(versionProc.stdout).text();
      await versionProc.exited;

      // Extract first line and trim
      const version = versionOut.split("\n")[0]?.trim();
      return { available: true, version };
    } catch {
      // Tool exists but --version failed, still mark as available
      return { available: true };
    }
  } catch {
    return { available: false };
  }
}
