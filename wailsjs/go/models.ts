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

