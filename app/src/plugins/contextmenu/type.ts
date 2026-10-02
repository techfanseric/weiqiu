
// 位置对象类型
export interface Position {
  x: number;
  y: number;
}
// 右键菜单
export namespace Contextmenu {
  // 菜单单项类型
  export interface Menu {
    id: string;
    label: string;
  }
  // 菜单选项属性
  export interface Options {
    title?: string;
    position: Position;
    menus: Menu[];
  }
}