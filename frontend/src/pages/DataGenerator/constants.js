// Constants and options
export const SEPARATOR_OPTIONS = [
    { id: 'newline', label: 'Newline' },
    { id: 'tab', label: 'Tab' },
    { id: 'comma', label: 'Comma' },
    { id: 'custom', label: 'Custom' },
    { id: 'none', label: 'None' }
];

export const OUTPUT_FORMAT_OPTIONS = [
    { id: 'raw', label: 'Raw' },
    { id: 'json', label: 'JSON' },
    { id: 'xml', label: 'XML' },
    { id: 'csv', label: 'CSV' },
    { id: 'yaml', label: 'YAML' }
];

export const HELP_CONTENT = {
    syntax: {
        title: 'Template Syntax',
        description: 'Uses Go template syntax.',
        link: 'https://pkg.go.dev/text/template',
        examples: [
            { syntax: '{{FunctionName}}', desc: 'Generate a single value' },
            { syntax: '{{Int 1 100}}', desc: 'Pass arguments' },
            { syntax: '{{Int .min .max}}', desc: 'Use variables' },
            { syntax: '{{range $i, $_ := iterate .BatchCount}}...{{end}}', desc: 'Batch generation loop' }
        ]
    },
    functions: [
        { category: 'UUID & IDs', items: 'UUID, ULID' },
        { category: 'Person', items: 'FirstName, LastName, Name, Gender, Email, Phone, PhoneFormatted' },
        { category: 'Internet', items: 'Username, URL, Domain, IP, IPv6, Mac, Password' },
        { category: 'Address', items: 'Street, City, State, StateAbr, Zip, Country, CountryAbr, Latitude, Longitude' },
        { category: 'Company', items: 'Company, CoSuffix, BS, CatchPhrase' },
        { category: 'Job', items: 'JobTitle, JobDesc, JobLevel' },
        { category: 'Number', items: 'Int min max, Float min max, Hex' },
        { category: 'Date', items: 'Past, Future, Recent, Birthday' },
        { category: 'Lorem', items: 'Word, Sentence, Paragraph, Lorem type count' },
        { category: 'Product', items: 'ProductName, ProductDesc, Category, Adjective, Material' },
        { category: 'Credit Card', items: 'CardType, CardNumber, CVV, Expiry' },
        { category: 'Other', items: 'Bool, StringCustom length upper lower nums sym, Price min max, RandomString opt1 opt2' },
        { category: 'Helpers', items: 'iterate count, last index total, default val defaultVal' }
    ]
};

// Initial state for reducer
export const initialState = {
    selectedPreset: 'uuid',
    template: '{{UUID}}',
    variables: {},
    mode: 'single',
    batchCount: 100,
    outputFormat: 'raw',
    separator: 'newline',
    customSeparator: '',
    output: '',
    isGenerating: false,
    error: null,
    presets: [],
    showHelp: false,
    duration: 0
};

// Reducer function
export function reducer(state, action) {
    switch (action.type) {
        case 'SET_PRESETS':
            return { ...state, presets: action.payload };
        case 'SELECT_PRESET':
            return { 
                ...state, 
                selectedPreset: action.payload.id,
                template: action.payload.template,
                variables: action.payload.defaultVars || {}
            };
        case 'SET_TEMPLATE':
            return { ...state, template: action.payload };
        case 'SET_VARIABLE':
            return { 
                ...state, 
                variables: { ...state.variables, [action.payload.name]: action.payload.value }
            };
        case 'SET_MODE':
            return { ...state, mode: action.payload };
        case 'SET_BATCH_COUNT':
            return { ...state, batchCount: action.payload };
        case 'SET_OUTPUT_FORMAT':
            return { ...state, outputFormat: action.payload };
        case 'SET_SEPARATOR':
            return { ...state, separator: action.payload };
        case 'SET_CUSTOM_SEPARATOR':
            return { ...state, customSeparator: action.payload };
        case 'SET_OUTPUT':
            return { ...state, output: action.payload };
        case 'SET_GENERATING':
            return { ...state, isGenerating: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_DURATION':
            return { ...state, duration: action.payload };
        case 'TOGGLE_HELP':
            return { ...state, showHelp: !state.showHelp };
        case 'RESET':
            return { ...initialState, presets: state.presets };
        default:
            return state;
    }
}
