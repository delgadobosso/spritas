export default function scrollBounce(elem) {
    var width = window.innerWidth;
    var resizeTime = false;
    var diff = elem.scrollWidth - elem.offsetWidth;
    var time1 = false;
    var time2 = false;

    window.onresize = () => {
        if (width === window.innerWidth) return;
        clearTimeout(resizeTime);
        resizeTime = setTimeout(() => {
            clearTimeout(time1);
            clearTimeout(time2);
            elem.classList.remove("Text-scrollBounce");
            elem.style.setProperty('--scroll-diff', `0px`);
            elem.style.setProperty('--scroll-time', `0s`);

            diff = elem.scrollWidth - elem.offsetWidth;
            if (diff > 0) {
                var timing = diff / 100; // Higher denom will be faster
                var delay = (diff > 100) ? 2000 : 4000;
                elem.className = elem.className + " Text-scrollBounce";
                elem.style.setProperty('--scroll-time', `${timing}s`);
                function scrollStart(elem, duration = 0) {
                    time1 = setTimeout(() => {
                        elem.style.setProperty('--scroll-diff', `-${diff}px`);
                        time2 = setTimeout(() => {
                            elem.style.setProperty('--scroll-diff', `0px`);
                            scrollStart(elem, timing * 1000);
                        }, (timing * 1000) + delay);
                    }, delay + duration);
                }
                scrollStart(elem);
            }
        }, 100);
    }

    if (diff > 0) {
        var timing = diff / 100; // Higher denom will be faster
        var delay = (diff > 100) ? 2000 : 4000;
        elem.className = elem.className + " Text-scrollBounce";
        elem.style.setProperty('--scroll-time', `${timing}s`);
        function scrollStart(elem, duration = 0) {
            time1 = setTimeout(() => {
                elem.style.setProperty('--scroll-diff', `-${diff}px`);
                time2 = setTimeout(() => {
                    elem.style.setProperty('--scroll-diff', `0px`);
                    scrollStart(elem, timing * 1000);
                }, (timing * 1000) + delay);
            }, delay + duration);
        }
        scrollStart(elem);
    }
}
