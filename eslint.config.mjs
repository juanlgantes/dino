import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                navigator: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                speechSynthesis: "readonly",
                SpeechSynthesisUtterance: "readonly",
                Math: "readonly",
                Date: "readonly",
                JSON: "readonly",
                URL: "readonly",
                Blob: "readonly",
                Image: "readonly",
                Audio: "readonly",
                DOMParser: "readonly",
                CustomEvent: "readonly",
                Event: "readonly",
                Promise: "readonly",
                Error: "readonly",
                Set: "readonly",
                Map: "readonly",
                WeakSet: "readonly",
                WeakMap: "readonly",
                Array: "readonly",
                Object: "readonly",
                String: "readonly",
                Number: "readonly",
                Boolean: "readonly",
                RegExp: "readonly",
                Symbol: "readonly",
                Function: "readonly",
                isNaN: "readonly",
                parseInt: "readonly",
                parseFloat: "readonly",
                decodeURIComponent: "readonly",
                encodeURIComponent: "readonly",
                confirm: "readonly",
                ResizeObserver: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error"
        }
    }
];
