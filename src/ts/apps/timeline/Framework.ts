import { APP } from "../../globals";
import { ITimelineApp, NotificationModel } from "./interfaces";
import { configure } from "../../configure/Framework";
import { transport } from "../../transport/Framework";
import { Notification } from "./Notification.model";

//-------------------------------------
export class TimelineApp implements ITimelineApp {
//-------------------------------------

    private _notifications:Array<Notification> = [];
    private _notificationTypes:Array<string> = [];      // ex: ["BLOG"]
    private _selectedNotificationTypes:Array<string> = [];
    private _pageNumber = 0;
    private _lastPage = false;
    private _loading = false;
    
    public showMine:boolean = true;

    get notifications():any {
        return this._notifications;
    }
    get isLoading():boolean {
        return this._loading;
    }
    get page(): number {
        return this._pageNumber;
    }
    get hasMorePage():boolean {
        return !this._lastPage;
    }
    get notificationTypes():Array<string> {
        return this._notificationTypes;
    }
    get selectedNotificationTypes():Array<string> {
        return this._selectedNotificationTypes;
    }
    get preferences():any {
        return configure.User.preferences[APP.TIMELINE];
    }

    async initialize() {
        await configure.User.loadAppPrefs(APP.TIMELINE);
        this.loadNotificationTypes()
        .then( () => {
            this.loadNotifications( true );
        });
    }

    private loadNotificationTypes() {
        return transport.http.get('/timeline/types').then( data => {
            this._notificationTypes = data;
        });
    }

    private loadNotifications( paginate?:boolean ):Promise<void> {
        if(this._loading || (paginate && this._lastPage)) {
            return Promise.resolve();
        }

        let types = this._selectedNotificationTypes;
        if(types.length===0) {
            types = this._notificationTypes;
        }

        if(types.length === 0) {
            this._lastPage = true;
            return Promise.resolve();
        }

        let params:{page:number, type:Array<string>, mine?:number} = {
            page: this.page,
            type: types,
            mine: 1
        };

        if( !this.showMine ){
            delete params.mine;
        }

        if(paginate) {
            this._loading = true;
        }

        return transport.http.get('/timeline/lastNotifications', {queryParams:params})
        .then( (response:{status:string, number:number, results:Array<NotificationModel>}) => {
            this._loading = false;

            if( response.status!=="ok" ) {
                //TODO notify error
                return;
            }

            if( response.number && response.results ){
                //#36034, add only non existing notification (avoid duplicate)
                const toAdd = response.results.filter( e=>this._notifications.findIndex(n => n._id===e._id) === -1 )
                .map( e => new Notification(e) );
                this._notifications.concat( toAdd );
                this._pageNumber++;
            } else {
                this._lastPage = true;
                //FIXME model.trigger('notifications.change')
            }
        })
        .catch( data => {
            this._loading = false;
            //FIXME notify.error(data);
        });
    }
}
