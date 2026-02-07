// JWT reducer for state management

export const initialState = {
    mode: 'decode', // 'decode' or 'encode'
    token: '',
    header: null,
    payload: null,
    signature: '',
    secret: '',
    error: '',
    validationMessage: '',
    isValid: null,
    encoding: 'utf-8',
    // Decode mode tabs
    headerTab: 0,
    payloadTab: 0,
    // Encode mode fields
    encodeHeaderTab: 0,
    encodePayloadTab: 0,
    headerInput: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
    payloadInput: '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
    algorithm: 'HS256',
    encodedToken: ''
};

export const jwtReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TOKEN':
            return { ...state, token: action.payload };
        case 'SET_DECODED':
            return {
                ...state,
                header: action.payload.header,
                payload: action.payload.payload,
                signature: action.payload.signature,
                error: action.payload.error,
                isValid: action.payload.isValid
            };
        case 'SET_SECRET':
            return { ...state, secret: action.payload };
        case 'SET_ENCODING':
            return { ...state, encoding: action.payload };
        case 'SET_MODE':
            return { ...state, mode: action.payload, error: '', validationMessage: '' };
        case 'SET_TAB':
            return {
                ...state,
                [action.payload.section + 'Tab']: action.payload.tab
            };
        case 'SET_HEADER_INPUT':
            return { ...state, headerInput: action.payload };
        case 'SET_PAYLOAD_INPUT':
            return { ...state, payloadInput: action.payload };
        case 'SET_ALGORITHM':
            return { ...state, algorithm: action.payload };
        case 'SET_ENCODED_TOKEN':
            return { ...state, encodedToken: action.payload };
        case 'SET_ENCODE_RESULT':
            return {
                ...state,
                encodedToken: action.payload.token,
                error: action.payload.error
            };
        case 'SET_VALIDATION':
            return {
                ...state,
                validationMessage: action.payload.message,
                isValid: action.payload.isValid
            };
        case 'GENERATE_EXAMPLE':
            return {
                ...state,
                token: action.payload.token,
                secret: action.payload.secret,
                error: '',
                validationMessage: ''
            };
        default:
            return state;
    }
};

// Action creators for convenience
export const actions = {
    setToken: (token) => ({ type: 'SET_TOKEN', payload: token }),
    setDecoded: (data) => ({ type: 'SET_DECODED', payload: data }),
    setSecret: (secret) => ({ type: 'SET_SECRET', payload: secret }),
    setEncoding: (encoding) => ({ type: 'SET_ENCODING', payload: encoding }),
    setMode: (mode) => ({ type: 'SET_MODE', payload: mode }),
    setTab: (section, tab) => ({ type: 'SET_TAB', payload: { section, tab } }),
    setHeaderInput: (input) => ({ type: 'SET_HEADER_INPUT', payload: input }),
    setPayloadInput: (input) => ({ type: 'SET_PAYLOAD_INPUT', payload: input }),
    setAlgorithm: (algorithm) => ({ type: 'SET_ALGORITHM', payload: algorithm }),
    setEncodedToken: (token) => ({ type: 'SET_ENCODED_TOKEN', payload: token }),
    setEncodeResult: (token, error) => ({ type: 'SET_ENCODE_RESULT', payload: { token, error } }),
    setValidation: (message, isValid) => ({ type: 'SET_VALIDATION', payload: { message, isValid } }),
    generateExample: (token, secret) => ({ type: 'GENERATE_EXAMPLE', payload: { token, secret } })
};