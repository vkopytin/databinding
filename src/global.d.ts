declare module '*.mustache' {
    interface IMustache {
        (...args: any[]): string;
    }

    var a: IMustache;
    export = a;
}
