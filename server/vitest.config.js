"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        fileParallelism: false,
        include: ['tests/**/*.ts'],
        exclude: ['**/*.d.ts', 'node_modules', 'dist'],
    },
});
//# sourceMappingURL=vitest.config.js.map