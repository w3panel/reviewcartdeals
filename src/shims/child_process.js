/** Browser-safe stub for Node child_process. */
export const execFileSync = () => ''
export const execSync = () => ''
export const spawn = () => ({ stdout: { on() {} }, stderr: { on() {} }, on() {} })

export default { execFileSync, execSync, spawn }
