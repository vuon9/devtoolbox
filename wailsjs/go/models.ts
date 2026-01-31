export namespace codeformatter {
	
	export class FormatRequest {
	    input: string;
	    formatType: string;
	    filter?: string;
	    minify: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FormatRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.input = source["input"];
	        this.formatType = source["formatType"];
	        this.filter = source["filter"];
	        this.minify = source["minify"];
	    }
	}
	export class FormatResponse {
	    output: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new FormatResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.output = source["output"];
	        this.error = source["error"];
	    }
	}

}

export namespace datagenerator {
	
	export class GenerateRequest {
	    template: string;
	    variables: Record<string, any>;
	    batchCount: number;
	    outputFormat: string;
	    separator: string;
	
	    static createFrom(source: any = {}) {
	        return new GenerateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.template = source["template"];
	        this.variables = source["variables"];
	        this.batchCount = source["batchCount"];
	        this.outputFormat = source["outputFormat"];
	        this.separator = source["separator"];
	    }
	}
	export class GenerateResponse {
	    output: string;
	    count: number;
	    error?: string;
	    durationMs: number;
	
	    static createFrom(source: any = {}) {
	        return new GenerateResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.output = source["output"];
	        this.count = source["count"];
	        this.error = source["error"];
	        this.durationMs = source["durationMs"];
	    }
	}
	export class Variable {
	    name: string;
	    type: string;
	    default: any;
	    options?: string[];
	    min?: number;
	    max?: number;
	    description?: string;
	
	    static createFrom(source: any = {}) {
	        return new Variable(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.default = source["default"];
	        this.options = source["options"];
	        this.min = source["min"];
	        this.max = source["max"];
	        this.description = source["description"];
	    }
	}
	export class TemplatePreset {
	    id: string;
	    name: string;
	    description: string;
	    template: string;
	    variables: Variable[];
	
	    static createFrom(source: any = {}) {
	        return new TemplatePreset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.template = source["template"];
	        this.variables = this.convertValues(source["variables"], Variable);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PresetsResponse {
	    presets: TemplatePreset[];
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new PresetsResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.presets = this.convertValues(source["presets"], TemplatePreset);
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ValidationResult {
	    valid: boolean;
	    error?: string;
	    message?: string;
	
	    static createFrom(source: any = {}) {
	        return new ValidationResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.valid = source["valid"];
	        this.error = source["error"];
	        this.message = source["message"];
	    }
	}

}

export namespace jwt {
	
	export class DecodeResponse {
	    header: Record<string, any>;
	    payload: Record<string, any>;
	    signature: string;
	    isValid: boolean;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new DecodeResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.header = source["header"];
	        this.payload = source["payload"];
	        this.signature = source["signature"];
	        this.isValid = source["isValid"];
	        this.error = source["error"];
	    }
	}
	export class EncodeResponse {
	    token: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new EncodeResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token = source["token"];
	        this.error = source["error"];
	    }
	}
	export class VerifyResponse {
	    isValid: boolean;
	    validationMessage: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new VerifyResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isValid = source["isValid"];
	        this.validationMessage = source["validationMessage"];
	        this.error = source["error"];
	    }
	}

}

export namespace main {
	
	export class GenerateBarcodeRequest {
	    content: string;
	    standard: string;
	    size: number;
	    level: string;
	    format: string;
	
	    static createFrom(source: any = {}) {
	        return new GenerateBarcodeRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.content = source["content"];
	        this.standard = source["standard"];
	        this.size = source["size"];
	        this.level = source["level"];
	        this.format = source["format"];
	    }
	}
	export class GenerateBarcodeResponse {
	    dataUrl: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new GenerateBarcodeResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dataUrl = source["dataUrl"];
	        this.error = source["error"];
	    }
	}

}

