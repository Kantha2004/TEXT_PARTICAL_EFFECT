
export const debounce = <T extends (...args: any[]) => any>(func: T, debounceTime: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, debounceTime);
    }
};