declare global {
    namespace NodeJS{
        interface ProcessEnv {
            botToken: string;
            guildID: string;
            enviroment: "dev" | "prod" | "debug";
        }
    }
}

export {};