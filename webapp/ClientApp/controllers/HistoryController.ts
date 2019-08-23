// Copyright (c) 2019-present, Rajeev-K.

import { App } from "../App";
import { HistoryPage, HistoryPageProps } from "../views/HistoryPage";
import { MessageBox } from "../views/MessageBox";
import * as Utils from "../Utils";

export class HistoryController extends MvcRouter.Controller {
    private historyPage: HistoryPage;
    private path: string;

    constructor(protected app: App) {
        super();
    }

    public load(params: MvcRouter.QueryParams): void {
        super.load(params);

        this.path = params['path'];
        const props: HistoryPageProps = {
            path: this.path
        };
        props.ref = component => {
            if (component) {
                this.historyPage = component;
                this.initPage();
            }
        };
        const element = UIBuilder.createElement(HistoryPage, props) as HTMLElement;
        const appBody = this.app.getAppBody();
        appBody.innerHTML = '';
        appBody.appendChild(element);
    }

    private initPage(): void {
        fetch(`/eureka-service/api/git/history?path=${encodeURIComponent(this.path)}`)
            .then(response => response.json())
            .then(result => {
                if (this.isLoaded()) {
                    if (result.error)
                        this.historyPage.displayError(result);
                    else
                        this.historyPage.displayHistory(result);
                }
            })
            .catch(error => this.isLoaded() && this.historyPage.displayError(error));
    }
}
