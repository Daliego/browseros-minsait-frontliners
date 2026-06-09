declare module "winbox" {
  interface WinBoxOptions {
    title?: string;
    width?: number | string;
    height?: number | string;
    x?: number | string;
    y?: number | string;
    mount?: HTMLElement;
    onclose?: () => boolean | void;
    onfocus?: () => void;
    onblur?: () => void;
    class?: string | string[];
    index?: number;
  }

  class WinBox {
    constructor(title: string, options?: WinBoxOptions);
    constructor(options: WinBoxOptions);
    close(force?: boolean): boolean;
    focus(): this;
    hide(): this;
    show(): this;
    minimize(flag?: boolean): this;
    maximize(flag?: boolean): this;
    fullscreen(flag?: boolean): this;
    move(x?: number | string, y?: number | string, skipUpdate?: boolean): this;
    resize(
      w?: number | string,
      h?: number | string,
      skipUpdate?: boolean
    ): this;
    setTitle(title: string): this;
    id: string;
  }

  export default WinBox;
}
