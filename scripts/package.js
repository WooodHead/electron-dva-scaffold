const path = require('path');
const packager = require('electron-packager');

const includeFiles = [
	'dist',
	'resources',
	'package.json'
];

function ignore(file) {
	if (!file) {
		return false;
	}
	if (file.startsWith('/')) {
		file = file.substr(1);
	}
	const willCopy = includeFiles.filter(include => {
		return file.startsWith(include);
	});
	if (willCopy.length > 0) {
		return false;
	}
	return true;
}

packager({
	name: 'Shopify',
	dir: path.join(__dirname, '..'),
	out: 'packager',
	// asar: true,
	overwrite: true,
	prune: false,
	ignore: ignore,
	extraResource: [
	]
}, (error, appPaths) => {
	if (error) {
		return error;
	} else {
		console.log(appPaths);
	}
});