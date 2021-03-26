import {PointsWaveSettings} from "./PointsWave/PointsWave";

export default class SettingsStorage {

    public constructor(private key: string) {
        try {
            const settings = new Map(JSON.parse(localStorage.getItem(this.key)));
            if (!settings) {
                this.initStorage()
            }
        } catch (e) {
            this.initStorage()
        }
    }

    private initStorage() {
        localStorage.setItem(this.key, JSON.stringify(Array.from(new Map().entries())));
    }

    public fetchList(): Map<string, PointsWaveSettings> {
        const arr = JSON.parse(localStorage.getItem(this.key));
        return new Map(arr);
    }

    public saveList(settingsList: Map<string, PointsWaveSettings>): void {
        return localStorage.setItem(this.key, JSON.stringify(Array.from(settingsList)));
    }

    public save(settings: PointsWaveSettings): Map<string, PointsWaveSettings> {
        const settingsList = this.fetchList();
        settingsList.set(settings.id, Object.assign({}, settings));
        this.saveList(settingsList);
        return settingsList;
    }

    public delete(settings: PointsWaveSettings): Map<string, PointsWaveSettings> {
        const settingsList = this.fetchList();
        settingsList.delete(settings.id);
        this.saveList(settingsList);
        return settingsList;
    }

    public update() {

    }
}
