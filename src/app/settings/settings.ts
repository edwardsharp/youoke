// import Dexie from 'dexie';

// interface ISettings {
//     id?: number;
//     name?: string;
// }

// //
// // Declare Database
// //
// class Settings extends Dexie {
//     settings: Dexie.Table<ISettings,number>;

//     constructor() {
//         super("Settings");
//         this.version(1).stores({
//             settings: "++id,name"
//         });
//     }
// }


export class Settings {
  constructor(public name: string, public description: string) {
  }
}