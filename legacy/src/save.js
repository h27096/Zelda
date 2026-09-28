const KEY='plateau-quest-v1';
export function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d?.version===1&&Number.isFinite(d.x)&&d.x>=0&&d.x<3600&&Number.isInteger(d.hp)&&d.hp>0&&d.hp<=5)return d}catch{}return null}
export function save(player,flags){try{localStorage.setItem(KEY,JSON.stringify({version:1,x:Math.round(player.x),hp:player.hp,flags})) ;return true}catch{return false}}
export function clear(){try{localStorage.removeItem(KEY)}catch{}}

