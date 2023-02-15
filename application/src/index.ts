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
		})
		this.App.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit()
			}
		})
	}
	
}
new GeneratorElectron();
