const { MODE } = import.meta.env
const rootPath = MODE === 'development' ? '' : import.meta.env.BASE_URL
const modelMap = {
  'color_icon': rootPath + '/image/icon_color.svg',
  'fly_icon': rootPath + '/image/icon_fly.svg',
  'check_icon': rootPath + '/image/icon_check.svg',
  'photo_icon': rootPath + '/image/icon_photo.svg',
  'setup_icon': rootPath + '/image/icon_setup.svg',
}
export const dockItem = [
  { id: 'fly',name: '起飞',icon: modelMap.fly_icon,scale: 1, margin: '10px',isHover:false,isNeighbor:false },
  { id: 'color',name: '颜色贴图',icon: modelMap.color_icon,scale: 1, margin: '10px',isHover:false,isNeighbor:false },
  { id: 'check',name: '模型切换',icon: modelMap.check_icon,scale: 1, margin: '10px,isHover:false,isNeighbor:false' },
  { id: 'photo',name: '照相',icon: modelMap.photo_icon,scale: 1, margin: '10px',isHover:false,isNeighbor:false },
  { id: 'setup',name: '设置',icon: modelMap.setup_icon,scale: 1, margin: '10px',isHover:false,isNeighbor:false },
]

export const nameType = {
  CLOCK: 'clock',
  SAIDAO: 'saidao',
  PHOTO: 'photo',
  COLOR: 'color',
  JUESE: 'juese',
}
