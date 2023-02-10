import Electron, { app, BrowserWindow, ipcRenderer } from 'electron'
import Path from 'path'

class GeneratorElectron {
	public Window: Electron.BrowserWindow = null!;
	public App: Electron.App = null!;
	public Root: HTMLDivElement = null!;
	public environment: string = process.env.PROCESS_ENV || 'prod';
		
	constructor() {
		this.App = app;
		this.App.whenReady().then(()=>{
			this.spawnWindow();
			this.initListeners();
		});
	}

	private spawnWindow() {
		this.Window = new BrowserWindow({
			y: 0,
			x: Electron.screen.getPrimaryDisplay().workAreaSize.width,
			width: (
				this.environment === 'dev' ? 1000 : 400
			),
			height: 600,
			webPreferences: {
				preload: Path.resolve(__dirname, './preload.js'),
				devTools: this.environment === 'dev',
				nodeIntegration: true
			}
		})
		this.Window.webContents.openDevTools()
		this.Window.loadFile(Path.resolve(__dirname, '../public/index.html'))
	}

	private initListeners() {
		this.App.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				this.spawnWindow()
			}
			// this.Window.moveTop();
		})
		this.App.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit()
			}
		})
	}
	
}
new GeneratorElectron();

// function createWindow() {
// 	const win = new BrowserWindow({
// 		width: 800,
// 		height: 600,
// 		webPreferences: {
// 			preload: Path.resolve(__dirname, './preload.js'),
// 			devTools: true,
// 			nodeIntegration: true
// 		}
// 	})
// 	win.webContents.openDevTools()
// 	win.loadFile(Path.resolve(__dirname, '../public/index.html'))
// }

// app.whenReady().then(() => {
// 	createWindow()

// 	app.on('activate', () => {
// 		if (BrowserWindow.getAllWindows().length === 0) {
// 			createWindow()
// 		}
// 	})
// 	app.on('browser-window-created', () => {
// 		// window.addEventListener('DOMContentLoaded', () => {
// 		const ROOT = document.getElementById('root');
// 		console.log(ROOT)
// 		if (ROOT !== null) {
// 			const ROLE = new HTMLSelectElement();
// 			const ROLE_FE = new HTMLOptionElement();
// 			const ROLE_FS = new HTMLOptionElement();
// 			ROLE.name = 'role-type';
// 			ROLE.innerHTML += ROLE_FE;
// 			ROLE.innerHTML += ROLE_FS;
// 			ROOT.insertAdjacentElement('afterbegin', ROLE)
// 		}
// 		// const replaceText = (selector: any, text: any) => {
// 		//   const element = document.getElementById(selector)
// 		//   if (element) element.innerText = text
// 		// }

// 		// for (const type of ['chrome', 'node', 'electron']) {
// 		//   replaceText(`${type}-version`, process.versions[type])
// 		// }
// 		// })
// 	})
// })
// app.on('browser-window-created', () => {

// })
// app.on('window-all-closed', () => {
// 	if (process.platform !== 'darwin') {
// 		app.quit()
// 	}
// })