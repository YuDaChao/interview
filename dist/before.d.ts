/**
 * before方法实现思路
 * 在调用目标方法之前先调用自己的方法
 */
declare function core(...args: any): void;
declare function study(): void;
declare const resultFn: any;
