

function delegate(element,eventType,selector,fn){
    element.addEventListener(eventType, function (e){
        let el = e.target;
        while (el && !el.matches(selector)){
            if (element === el){
                el = null;
                break;
            }
            el = e.parentNode;
        }
        el && fn.call(el,e,el)
    });
    return element;
}

function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func.apply(this, args);
    }
}
