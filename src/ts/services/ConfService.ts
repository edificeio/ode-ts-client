import { configure } from "../configure/Framework";
import { IThemeConf, IThemeConfOverriding } from "../configure/interfaces";
import { App } from "../globals";
import { IWebApp } from "../session/interfaces";
import { IOdeServices } from "./OdeServices";

export interface IOdeTheme {
  basePath: string;
  logoutCallback: string;
  skin: string;
  skinName: string;
  skins: Array<IThemeConfOverriding>;
  themeName: string;
  themeUrl: string;
  is1d: boolean;
  bootstrapVersion: string;
  bootstrapPath: string;
}

export interface IGetConf {
  conf: IThemeConf;
  app: IWebApp | undefined;
  theme: IOdeTheme;
  applications: IWebApp[];
}

export class ConfService {
  constructor(private context: IOdeServices) {}

  private get http() {
    return this.context.http();
  }

  private get cdnDomain(): string {
    return configure.Platform.cdnDomain;
  }

  async getConf(paramApp: App): Promise<IGetConf> {
    const [conf, app, theme, applications] = await Promise.all([
      this.getThemeConf(),
      this.getWebAppConf(paramApp),
      this.getTheme(),
      this.getApplicationsList(),
    ]);
    return {
      conf,
      app,
      theme,
      applications,
    };
  }

  getCdnUrl(): string | undefined {
    //TODO to implement
    console.warn("[getCdnUrl] Not implemented yet");
    return undefined;
  }

  async savePreference<T>(key: string, value: T) {
    this.http.putJson(`/userbook/preference/${key}`, value);
  }

  async getPreference<T>(key: string): Promise<T> {
    const res = await this.http.get<{ preference: string }>(
      `/userbook/preference/${key}`,
    );
    return JSON.parse(res.preference) as T;
  }

  private async getThemeConf(version?: string): Promise<IThemeConf> {
    const res = await this.http.getScript<IThemeConf>(
      "/assets/theme-conf.js",
      { queryParams: { v: version } },
      "exports.conf",
    );
    return res;
  }

  private async getApplicationsList(): Promise<IWebApp[]> {
    const response = await this.http.get<{ apps: Array<IWebApp> }>(
      `/applications-list`,
    );
    return response.apps;
  }

  async getWebAppConf(app: App): Promise<IWebApp | undefined> {
    const response = await this.getApplicationsList();
    const find = response.find((item) => {
      if (item?.prefix) {
        return item?.prefix.replace("/", "") === app;
      }
    });
    return find;
  }

  async getTheme(version?: string): Promise<IOdeTheme> {
    const theme = await this.http.get<IOdeTheme>("/theme", {
      queryParams: { _: version },
    });
    const conf: any = await this.getThemeConf();
    const skin = theme.themeName;
    const skins = conf?.overriding.find(
      (item: { child: any }) => item.child === skin,
    ).skins;
    const bootstrapVersion = conf?.overriding.find(
      (item: { child: any }) => item.child === skin,
    ).bootstrapVersion;
    const bootstrapPath = `${this.cdnDomain}/assets/themes/${bootstrapVersion}/skins/${theme.skinName}`;
    const is1d =
      conf?.overriding.find((item: { child: any }) => item.child === skin)
        .parent === "panda";

    return {
      basePath: `${this.cdnDomain}${theme.skin}../../`,
      logoutCallback: theme.logoutCallback,
      skin: theme.skin.split("/assets/themes/")[1].split("/")[0],
      skinName: theme.skinName,
      skins,
      themeName: theme.themeName,
      themeUrl: theme.skin,
      bootstrapVersion,
      bootstrapPath,
      is1d,
    };
  }
}
