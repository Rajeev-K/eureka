// Copyright (c) 2019-present, Rajeev-K.

import { SearchController } from "./controllers/SearchController";
import { AdminController } from "./controllers/AdminController";
import { HistoryController } from "./controllers/HistoryController";
import { DiffController } from "./controllers/DiffController";

export class App extends MvcRouter.App {
    constructor() {
        super({
            appPath: '/search',
            appBody: document.getElementById('app-body')
        });

        const router = this.getRouter();
        router.addRoute("/", SearchController);
        router.addRoute("/admin", AdminController);
        router.addRoute("/history", HistoryController);
        router.addRoute("/diff", DiffController);

        this.setupEventHandlers();

        this.load();
    }

    private setupEventHandlers(): void {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    private onWindowResize(): void {
        const controller: any = this.getRouter().getCurrentController();
        if (controller && typeof controller.onWindowResize === 'function') {
            controller.onWindowResize();
        }
    }
}

export function startup() {
    new App();
}
