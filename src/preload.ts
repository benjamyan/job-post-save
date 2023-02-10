import * as Config from './config';
import { JobInfoPackage } from './types';
// import { generateJobApplicationPackage } from './generate';
import { JobPackageGenerator } from './generate';

class DomRenderer {
	private Root: HTMLElement = null!;
	private FormItems: Record<any, any> = {
		RoleSelect: {
			tagName: 'select',
			children: Config.roleTypeOptions.map((type)=>({
				tagName: 'option',
				innerText: type
			})),
			onchange: ()=>{
				this.jobInfo.type = this.FormItems.RoleSelect.value; 
			}
		},
		JobPostUrl: {
			tagName: 'input',
			type: 'text',
			placeholder: 'URL',
			required: true,
			oninput: ()=>{
				this.jobInfo.href = this.FormItems.JobPostUrl.value; 
			}
		},
		CompanyName: {
			tagName: 'input',
			type: 'text',
			placeholder: 'Company',
			required: true,
			oninput: ()=>{
				this.jobInfo.company = this.FormItems.CompanyName.value; 
			}
		},
		RoleTitle: {
			tagName: 'input',
			type: 'text',
			placeholder: 'Title',
			required: true,
			oninput: ()=>{
				this.jobInfo.title = this.FormItems.RoleTitle.value; 
			}
		},
		JobDescription: {
			tagName: 'textarea',
			placeholder: 'Description',
			oninput: ()=>{
				this.jobInfo.description = this.FormItems.JobDescription.value; 
			}
		},
		ClearButton: {
			tagName: 'input',
			type: 'button',
			value: 'Clear',
			onclick: this.formClearAction.bind(this)
		},
		SubmitButton: {
			tagName: 'input',
			type: 'submit',
			innerText: 'submit'
		}
	};
	private FormElement = {
		Form: {
			tagName: 'form',
			onsubmit: this.formSubmitAction.bind(this),
			children: this.FormItems
		}
	};
	public jobInfo: JobInfoPackage = {
		type: Config.roleTypeOptions[0],
		href: null!,
		company: null!,
		title: null!,
		description: null!,
	}
	public generator: JobPackageGenerator | null = null;
	
	constructor() {
		this.initDomPopulationFromFile();
		this.mountLocalVariables();
		if (this.Root !== null) {
			this.populateDomElements(this.FormElement, this.Root);
		}
	}

	private initDomPopulationFromFile() {
		const replaceText = (selector: any, text: any) => {
			const element = document.getElementById(selector)
			if (element) element.innerText = text
		}
		for (const type of ['chrome', 'node', 'electron']) {
			replaceText(`${type}-version`, process.versions[type])
		}
	}
	private mountLocalVariables() {
		const ROOT = document.getElementById('root')
		if (ROOT !== null) {
			this.Root = ROOT;
			this.jobInfo = new Proxy(this.jobInfo, {
				set: (target, key, value)=> {
					if (key === 'type') {
						target[String(key)] = value.toLowerCase();
					} else {
						target[String(key)] = value;
					}
					console.log(`SET ${String(key)}: ${this.jobInfo[String(key)]}`);
					return true;
				}
			});
		}
	}
	private formClearAction() {
		Object.values(this.FormItems).forEach((element)=>{
			if (
				(element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') 
				&& element.value.length > 0 
				&& element.type !== 'button'
			) {
				element.value = '';
			}
		})

		for (const item in this.jobInfo) {
			this.jobInfo[item] = '';
		}
	}
	private formSubmitAction(event: FormDataEvent) {
		event.preventDefault();

		for (const item in this.jobInfo) {
			if (item === 'description') continue;
			if (this.jobInfo[item] === null || this.jobInfo[item].length === 0) {
				alert('Fill in all required fields before submitting.');
				return;
			}
		}

		this.generator = new JobPackageGenerator({...this.jobInfo})
		this.generator.on('abort', ()=> {
			alert('Error when saving.');
			this.generator = null;
		})
		this.generator.on('complete', ()=>{
			alert('Saved post.');
			this.generator = null;
		})
	}
	private populateDomElements(domElementDefinition: Record<any, any>, targetElement: HTMLElement) {
		let NewElement,
			currentDefinition,
			currentAttribute;
		for (const definition in domElementDefinition) {
			currentDefinition = domElementDefinition[definition];

			NewElement = document.createElement(currentDefinition.tagName);
			delete currentDefinition.tagName

			for (const attribute in currentDefinition) {
				currentAttribute = currentDefinition[attribute]
				if (attribute === 'children') {
					this.populateDomElements(currentAttribute, NewElement);
					delete currentDefinition[attribute]
				} else {
					NewElement[attribute] = currentDefinition[attribute];
				}
			}
			
			domElementDefinition[definition] = NewElement;
			targetElement.insertAdjacentElement('beforeend', NewElement);
		}
	}
	
}

window.addEventListener('DOMContentLoaded', ()=> new DomRenderer())