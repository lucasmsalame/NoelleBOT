import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from "discord.js";
import { CommandType } from "../typings/Commands";
import glob from 'glob'
import { promisify } from "util";
import { registerCommandsOptions } from "../typings/client";
import { Event } from "./Event";

const globPromise = promisify(glob)

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor(){
        super({intents: 32767});
    }

    start() {
        this.registerModules()
        this.login(process.env.botToken)
    }
    async importFile(FilePath: string){
        return (await import(FilePath))?.default;
    }

    async registerCommands({ commands, guildId }: registerCommandsOptions){
        if(guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Estou registrando os comandos da guilda ${guildId}`)
        }else{
            this.application?.commands.set(commands);
            console.log("Registrando comandos globais")
        }
    }

    async registerModules(){
        //Commands aqui pfvr sem errar
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`
        );
        console.log({commandFiles})
        commandFiles.forEach(async FilePath => {
            const command: CommandType = await this.importFile(FilePath)
            if(!command.name) return;

            this.commands.set(command.name, command);
            slashCommands.push(command)
        });

        const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`
        );
        eventFiles.forEach(async filePath => {
            const event: Event <keyof ClientEvents> = await this.importFile(filePath)
            this.on(event.event, event.run)
        })
    }
}