import { App } from "../globals";
import { AppModel, IUserPreferences, UserPreferenceKey } from "./interfaces";
import { EVENT_NAME, BootstrappedNotice, PreferencesUpdated } from "../notify/interfaces";
import { transport } from "../transport/Framework";
import { notify } from "../notify/Framework";
import { IUserInfo } from "../session/interfaces";
import { session } from "../session/Framework";

//-------------------------------------
class UserPreferences implements IUserPreferences {
//-------------------------------------
	data:{[key in UserPreferenceKey]?: any} = {};

	get( key:UserPreferenceKey ): any {
		return this.data[key];
	}

	load( key:UserPreferenceKey, defaultTo?:any ):Promise<any> {
		return transport.http.get('/userbook/preference/'+key)
		.then( data => {
			try {
				return JSON.parse(data.preference);
			} catch(e) {
				return defaultTo ?? {};
			}
		})
		.then( prefs => {
			this.data[key] = prefs;
			return prefs;
		});
	}
	
	update( key:UserPreferenceKey, data:any ):UserPreferences {
		if(data !== undefined){
			this.data[key] = data;
		}
		notify.onEvent<PreferencesUpdated>( EVENT_NAME.PREFERENCES_UPDATED ).next( new PreferencesUpdated(key, data) );
		return this;
	}

	save( key:UserPreferenceKey ):Promise<void> {
		//FIXME code review
		return transport.http.putJson('/userbook/preference/' + key, this.data[key]);
	}
}

//-------------------------------------
export class User {
//-------------------------------------
	private _me:IUserInfo = null as unknown as IUserInfo;
	private _keepOpenOnLogout:boolean = false;
	private _preferences:IUserPreferences = new UserPreferences();
	private _bookmarkedApps:Array<AppModel> = [];

	get keepOpenOnLogout():boolean {
		return this._keepOpenOnLogout;
	}

	get preferences():IUserPreferences {
		return this._preferences;
	}

	get bookmarkedApps():Array<AppModel> {
		// will be empty if initialize() was not called.
		return this._bookmarkedApps;
	}

	initialize( version?:string ) {
		this.loadPublicConf();
		const sessionSubscription = notify.onEvent<BootstrappedNotice>( EVENT_NAME.BOOTSTRAPPED ).subscribe( notice => {
			sessionSubscription?.unsubscribe();
			if(notice.userInfo) {
				this.setCurrentModel(notice.userInfo);
			}
		});
	}

	private setCurrentModel( me:IUserInfo ) {
		this._me = me;
		this._preferences = new UserPreferences();
		this.loadBookmarks();
	}

	private loadPublicConf():Promise<any> {
		return transport.http.get<any>( '/conf/public' ).then( publicConf => {
			this._keepOpenOnLogout = publicConf?.keepOpenOnLogout || false;
			return publicConf;
		});
	}

	/** Bookmarks : pinned apps */
	private async loadBookmarks() {
		return await transport.http.get('/userbook/preference/apps').then( data => {
			if(!data.preference){
				data.preference = null;
			}
			const tmp = JSON.parse(data.preference) as Array<AppModel>;
			let myApps:{
				bookmarks:Array<string>,	// Array of app names
				applications: []
			};

			// If myApps is array
			if( tmp && tmp.length && typeof tmp.concat==="function" ) {
				this._bookmarkedApps = tmp;
				myApps = {
					bookmarks: tmp.map( app => app.name ),
					applications: []
				}
				transport.http.putJson('/userbook/preference/apps', myApps);
				return;
			}

			myApps = {
				bookmarks: [],
				applications: []
			}

			let upToDate = true;
			const remove:Array<string> = [];
			myApps.bookmarks.forEach( (appName, index) => {
				const foundApp = this._me.apps.find( app => app.name===appName );
				if(foundApp){
					let app = Object.assign( {}, foundApp );
					this._bookmarkedApps.push( app );
				} else {
					remove.push(appName);
					upToDate = false;
				}
			});
			remove.forEach( appName => {
				let index = myApps.bookmarks.indexOf( appName );
				myApps.bookmarks.splice(index, 1);
			});
			if(!upToDate){
				transport.http.putJson('/userbook/preference/apps', myApps);
			}
		});

		// TODO Finir l'interface, voir infra-front/me.ts
	}

	public loadAppPrefs(app:App):Promise<any> {
		return this.preferences.load(app, {});
	}

	public saveAppPrefs(app:App):Promise<void> {
		return this.preferences.save(app);
	}

	public loadLanguage():Promise<string> {
		return this.preferences.load("language", {'default-domain': session.session.currentLanguage})
		.then( data => data['default-domain'] );
	}

	public saveLanguage( lang:string ):Promise<void> {
		return this.preferences.update("language", {'default-domain': lang}).save("language");
	}

}