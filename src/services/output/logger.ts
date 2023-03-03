// const log = {
//     info: (message: string) =>
//       console.log("\x1b[1;34m%s\x1b[0m", "Info:  ", message),
//     user: (message: string) =>
//       console.log("\x1b[1;32m%s\x1b[0m", "User:  ", message),
//     error: (message: string, error?: any) =>
//       error
//         ? console.log("\x1b[1;31m%s\x1b[0m", "Error: ", message, "\n", error)
//         : console.log("\x1b[1;31m%s\x1b[0m", "Error: ", message),
//         warn: (message: string, error?: any) =>
//         error
//           ? console.log("\x1b[1;33m%s\x1b[0m", "Warn:  ", message, "\n", error)
//           : console.log("\x1b[1;33m%s\x1b[0m", "Warn:  ", message),
//   };
  
//   export default log;

export default class Logger {

    private static time() {
        return new Date().toISOString().slice(0, 19)
    }

    public static info(message: string) {
        console.log("\x1b[1;32m%s\x1b[0m", `${this.time()} [Info]:  `, message)
    }

    public static pending(message: string) {
        console.log("\x1b[1;34m%s\x1b[0m", `${this.time()} [Wait]:  `, message)
    }

    public static error(message: string) {
        console.log("\x1b[1;31m%s\x1b[0m", `${this.time()} [Error]: `, message)
    }
}   