const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
	{
		files: ["src/**/*.ts"],
		ignores: ["out/**", "dist/**", "**/*.d.ts"],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 6,
			sourceType: "module"
		},
		plugins: {
			"@typescript-eslint": tsPlugin
		},
		rules: {
			"@typescript-eslint/naming-convention": [
				"warn",
				{
					selector: "import",
					format: ["camelCase", "PascalCase"]
				}
			],
			curly: "warn",
			eqeqeq: "warn",
			"no-throw-literal": "warn",
			semi: "warn"
		}
	}
];
