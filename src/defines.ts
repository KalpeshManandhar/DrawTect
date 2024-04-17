export const CODE_ACTIONS_DOC_TYPES: Array<string> = [
    "typescript",
    "javascript",
    "c",
    "cpp",
    "python",
    "java"
];

    
export const EXTENSION_COMMANDS = {
    test: 'DrawTect.test',
    open: 'DrawTect.open',
    create: 'DrawTect.create'
};

export const DIRS_TO_CHECK = [
    "dt",
    "drawtect",
    "docs",
    "deeznuts"
];


// the dir with the code for the whiteboard, relative to the workspace
export const WHITEBOARD_FOLDER = "whiteboard";
// the dir with the preprocessed code, exported by the preprocessor
export const PREPROCESSOR_EXPORT_FOLDER = "preprocessed";

export const DEV_MODE = true;