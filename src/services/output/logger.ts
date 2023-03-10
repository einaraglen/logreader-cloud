export default class Logger {

    private static time() {
        return new Date().toISOString().slice(0, 19)
    }

    public static info(...args: any) {
        console.log("\x1b[1;32m%s\x1b[0m", `${this.time()} [Info]:  `, ...args)
    }

    public static pending(...args: any) {
        console.log("\x1b[1;34m%s\x1b[0m", `${this.time()} [Wait]:  `, ...args)
    }

    public static error(...args: any) {
        console.log("\x1b[1;31m%s\x1b[0m", `${this.time()} [Error]: `, ...args)
    }
}   