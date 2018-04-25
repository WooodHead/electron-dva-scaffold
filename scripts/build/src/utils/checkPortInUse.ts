import * as detectPort from 'detect-port';
const chalk = require('chalk');

(function CheckPortInUse() {
	const port: string = process.env.PORT || '1212';

	detectPort(parseInt(port), (err: Error, availablePort: number) => {
		if (port !== String(availablePort)) {
			throw new Error(chalk.whiteBright.bgRed.bold(`Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4343 npm run dev`));
		} else {
			process.exit(0);
		}
	});
}());
