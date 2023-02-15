/// <reference path='../node_modules/@types/chrome/index.d.ts' />

class ExtensionMenu {
    private root: HTMLElement = null!;

    constructor() {
        this.mountMenu();
        console.log(this.root)
    }

    private mountMenu() {
        const ROOT = document.getElementById('root');
        if (ROOT !== null) {
            this.root = ROOT;
        }
    }

}
new ExtensionMenu();