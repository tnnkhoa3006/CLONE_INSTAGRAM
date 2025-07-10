import path from 'path';
import DataUriParser from 'datauri/parser.js';

const parser = new DataUriParser();

const getDataUri = (file) => {
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer).content;
}

export default getDataUri;