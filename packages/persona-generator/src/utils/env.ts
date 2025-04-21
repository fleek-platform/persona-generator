const DEFAULT_ESBUILD_DEFINED_PROCESS_ENV_PREFIX = "process.env.";

type Optional<T = void> = Partial<Record<keyof T, string>>;

export const parseEnvVarsAsKeyVal = <T extends Record<string, string>>({
	defined,
	keyPrefix = DEFAULT_ESBUILD_DEFINED_PROCESS_ENV_PREFIX,
}: {
	defined: Optional<T>;
	keyPrefix?: string;
}) => {
	const keys = Object.keys(defined);

	if (!keys.length) {
		throw new Error("Environment Variable not set.");
	}

	return keys.reduce(
		(define, envName) => {
			if (!defined[envName as keyof T]) {
				throw new Error(`Environment Variable ${envName} not set.`);
			}

			define[`${keyPrefix}${envName}`] = JSON.stringify(
				defined[envName as keyof T],
			);

			return define;
		},
		{} as Record<string, string>,
	);
};
