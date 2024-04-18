const dock = document.querySelector('.dock');
const dockItems = document.querySelectorAll('.dock-item');

const defaultItemScale = 1;
const hoverItemScale = 1.5;
const neighborItemScale = 1.2;

const defaultMargin = '10px';
const expandMargin = '20px';

const updateDock = () => {
    dockItems.forEach((item) => {
        let scale = defaultItemScale;
        let margin = defaultMargin;

        if(item.isHover){
            scale = hoverItemScale;
            margin = expandMargin;
        }else if(item.isNeighbor){
            scale = neighborItemScale;
            margin = expandMargin;
        }
        item.style.transform = `scale(${scale})`;
        item.style.margin = `0 ${margin}`;
    });
};

dockItems.forEach((item)=>{
    item.addEventListener('mouseenter', (e)=>{
        dockItems.forEach(otherItem=>{
            otherItem.isHover = otherItem === item;
            otherItem.isNeighbor = Math.abs(
                Array.from(dockItems).indexOf(otherItem) - Array.from(dockItems).indexOf(item)
            ) === 1;
        });
        updateDock()
    });
});

dock.addEventListener('mouseleave',()=>{
    dockItems.forEach(item=>{
        item.isHover = item.isNeighbor = false;
    });
    updateDock()
})

