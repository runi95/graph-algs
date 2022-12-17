const fs = require('fs-extra');
const path = require('path');

fs.cpSync('./src/templates', './dist/templates', {
    recursive: true, filter: (source) => {
        const stats = fs.lstatSync(source);
        if (stats.isDirectory()) return true;
        if (path.extname(source) === '.json') return true;

        return false;
    }
});
