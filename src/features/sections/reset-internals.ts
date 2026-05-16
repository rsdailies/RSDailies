export type LoadFn = <T = any>(key: string, fallback?: T) => T;
export type SaveFn = (key: string, value: any) => void;
export type RemoveFn = (key: string) => void;
export function reader(load?: LoadFn) { return load || ((_: string, fallback: any) => fallback); }
export function writer(save?: SaveFn) { return save || (() => {}); }
