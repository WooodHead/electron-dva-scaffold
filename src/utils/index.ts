import * as lodash from 'lodash';

/**
 * 数组内查询
 */
export function queryArray(array: any[], key: string, keyAlias = 'key') {
    if (!(array instanceof Array)) {
        return null;
    }
    const item = array.filter(_ => _[keyAlias] === key);
    if (item.length) {
        return item[0];
    }
    return null;
}

/**
 * 数组格式转树状结构
 */
export function arrayToTree(array: any[], id = 'id', pid = 'pid', children = 'children') {
    let data = lodash.cloneDeep(array);
    let result = [];
    let hash = {};
    data.forEach((item, index) => {
        hash[data[index][id]] = data[index];
    });

    data.forEach((item) => {
        let hashVP = hash[item[pid]];
        if (hashVP) {
            if (!hashVP[children]) {
                hashVP[children] = [];
            }
            hashVP[children].push(item);
        } else {
            result.push(item);
        }
    });
    return result;
};