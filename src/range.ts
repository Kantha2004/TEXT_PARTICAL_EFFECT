const sitSilderColor = (el: HTMLInputElement) => {
    const sliderValue = Number(el.value);
    const progress = ((sliderValue - Number(el.min)) / (Number(el.max) - Number(el.min))) * 100;
    el.style.background = `linear-gradient(to right, #f50 ${progress}%, #ccc ${progress}%)`;
    return sliderValue;
};

export const initSlider = (fn?: (arg: number) => void) => {
    const sliderEl = document.querySelector("#range") as HTMLInputElement;
    if (!sliderEl) return;
    sitSilderColor(sliderEl);
    sliderEl.addEventListener("input", (event: Event) => {
        const target = event.target as HTMLInputElement;
        const tempSliderValue = sitSilderColor(target);
        if (typeof fn === 'function') fn(tempSliderValue);
    });
};