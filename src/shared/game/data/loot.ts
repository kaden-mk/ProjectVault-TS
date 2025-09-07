const dataList = {
    Cash: 1000,
    Money: 245_000,
}

export namespace Loot {
    export function value(loot: keyof typeof dataList) {
        return dataList[loot];
    }
}