declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_BASE_URL?: string;
    // otras variables de entorno que uses
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
};