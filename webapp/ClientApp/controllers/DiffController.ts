// Copyright (c) 2019-present, Rajeev-K.

import { App } from "../App";
import { DiffPage, DiffPageProps } from "../views/DiffPage";
import { MessageBox } from "../views/MessageBox";
import * as Utils from "../Utils";

export class DiffController extends MvcRouter.Controller {
    private diffPage: DiffPage;
    private path: string;
    private hash1: string;
    private hash2: string;

    constructor(protected app: App) {
        super();
    }

    public load(params: MvcRouter.QueryParams): void {
        super.load(params);

        this.path = params['path'];
        this.hash1 = params['hash1'];
        this.hash2 = params['hash2'];
        const props: DiffPageProps = {
            path: this.path
        };
        props.ref = component => {
            if (component) {
                this.diffPage = component;
                this.initPage();
            }
        };
        const element = UIBuilder.createElement(DiffPage, props) as HTMLElement;
        const appBody = this.app.getAppBody();
        appBody.innerHTML = '';
        appBody.appendChild(element);
    }

    private async initPage() {
        try {
            const p1 = fetch(`/eureka-service/api/git/fileAtRevision?path=${encodeURIComponent(this.path)}&revision=${this.hash1}`);
            const p2 = fetch(`/eureka-service/api/git/fileAtRevision?path=${encodeURIComponent(this.path)}&revision=${this.hash2}`);
            const responses = await Promise.all([p1, p2]);
            const text1 = responses[0].status === 200 ? await responses[0].text() : '';
            const text2 = responses[1].status === 200 ? await responses[1].text() : '';
            this.diffPage.displayDiff(text1, text2);
        }
        catch (error) {
            if (this.isLoaded())
                this.diffPage.displayError(error);
        }
    }

    public onWindowResize(): void {
        this.diffPage.onWindowResize();
    }
}
