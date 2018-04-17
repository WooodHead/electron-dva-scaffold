import { rootPath } from "base/node/package";
import * as path from 'path';

interface ServerConfig {
    apiPrefix: string;
}

export const server: ServerConfig = Object.create(null);
server.apiPrefix = '/api/v1';

export const openPages = ['/login'];

export const name = '通晓管理后台';
export const logo = path.join(rootPath, '/resources/images/logo.png');